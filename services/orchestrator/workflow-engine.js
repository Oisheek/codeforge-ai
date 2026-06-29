const { EventEmitter } = require('events');
const { LOOP_STATUS, AGENT_ROLES } = require('@codeforge/shared/constants');

/**
 * Manages the high-level workflow: plan → code → test → review → docs.
 * Coordinates between agents in the correct order.
 */
class WorkflowEngine extends EventEmitter {
  constructor({ llmClient, tools, projectPath }) {
    super();
    this.llmClient = llmClient;
    this.tools = tools;
    this.projectPath = projectPath;
  }

  /**
   * Run the full workflow for a task.
   * @param {string} task - User's task description
   * @param {object} taskManager - TaskManager instance for state tracking
   * @param {ExecutionEngine} executor - ExecutionEngine for running actions
   * @returns {Promise<{success: boolean, reason?: string}>}
   */
  async runWorkflow(task, taskManager, executor) {
    // ── Phase 1: Supervisor analyzes and creates a plan ───
    taskManager.setStatus(LOOP_STATUS.ANALYZING);
    this.emit('update', { type: 'agent_message', agent: AGENT_ROLES.SUPERVISOR, content: 'Analyzing repository and task...' });

    const repoSummary = await this._buildContext();
    const planResult = await this._runSupervisor(task, repoSummary, taskManager);

    if (!planResult || !planResult.plan || planResult.plan.length === 0) {
      return { success: false, reason: 'Supervisor could not create a plan.' };
    }

    taskManager.setPlan(planResult.plan);
    this.emit('update', { type: 'agent_message', agent: AGENT_ROLES.SUPERVISOR, content: planResult.thoughts, actions: planResult.plan });

    // ── Phase 2: Coder implements each step ───────────────
    for (let i = 0; i < planResult.plan.length; i++) {
      const step = planResult.plan[i];
      taskManager.currentStep = i;
      taskManager.setStatus(LOOP_STATUS.CODING);

      this.emit('update', {
        type: 'agent_message',
        agent: AGENT_ROLES.CODER,
        content: `Working on step ${i + 1}: ${step.description}`,
      });

      const codeResult = await this._runCoder(step, repoSummary, taskManager, executor);
      this.emit('update', {
        type: 'agent_message',
        agent: AGENT_ROLES.CODER,
        content: codeResult.thoughts,
        actions: codeResult.actions,
      });

      // Execute actions
      for (const action of codeResult.actions || []) {
        const result = await executor.execute(action);
        taskManager.recordAction(action, result.output);

        this.emit('update', {
          type: 'action_result',
          content: `${action.type}: ${result.success ? '✓' : '✗'} ${truncate(result.output, 500)}`,
          meta: { action, result: { success: result.success, output: truncate(result.output, 200) } },
        });

        if (!result.success) {
          taskManager.recordError(result.output);
        }
      }

      // Run build/test after each step
      taskManager.setStatus(LOOP_STATUS.EXECUTING);
      const buildResult = await executor.execute({
        type: 'run_command',
        command: step.verifyCommand || planResult.buildCommand || 'npm run build',
      });

      if (!buildResult.success) {
        // Phase 3: Debug loop
        taskManager.incrementAttempt();
        taskManager.recordError(buildResult.output);

        const fixResult = await this._debugLoop(
          buildResult.output,
          buildResult.data?.errors || [],
          repoSummary,
          taskManager,
          executor,
          planResult.maxFixAttempts || 5
        );

        if (!fixResult) {
          return { success: false, reason: `Failed to fix errors after ${taskManager.attemptCount} attempts.` };
        }
      }
    }

    // ── Phase 4: Reviewer checks final changes ────────────
    taskManager.setStatus(LOOP_STATUS.REVIEWING);
    this.emit('update', { type: 'agent_message', agent: AGENT_ROLES.REVIEWER, content: 'Reviewing changes...' });

    const reviewResult = await this._runReviewer(task, repoSummary, taskManager);
    this.emit('update', { type: 'agent_message', agent: AGENT_ROLES.REVIEWER, content: reviewResult.thoughts });

    if (reviewResult.issues && reviewResult.issues.length > 0) {
      // Feed issues back to coder for one more fix
      this.emit('update', { type: 'agent_message', agent: AGENT_ROLES.CODER, content: 'Fixing review issues...' });
      const fixResult = await this._runCoder(
        { description: `Fix review issues: ${reviewResult.issues.join('; ')}`, verifyCommand: planResult.buildCommand },
        repoSummary,
        taskManager,
        executor
      );

      for (const action of fixResult.actions || []) {
        const result = await executor.execute(action);
        taskManager.recordAction(action, result.output);
        this.emit('update', {
          type: 'action_result',
          content: `${action.type}: ${result.success ? '✓' : '✗'}`,
          meta: { action, result: { success: result.success } },
        });
      }
    }

    // ── Phase 5: Documentation ────────────────────────────
    taskManager.setStatus(LOOP_STATUS.DOCUMENTING);
    this.emit('update', { type: 'agent_message', agent: AGENT_ROLES.DOCS, content: 'Generating documentation...' });

    const docsResult = await this._runDocs(task, taskManager);
    this.emit('update', { type: 'agent_message', agent: AGENT_ROLES.DOCS, content: docsResult.summary });

    return { success: true };
  }

  /**
   * Debug loop: keeps trying to fix errors until success or max attempts.
   */
  async _debugLoop(errorOutput, parsedErrors, repoSummary, taskManager, executor, maxFixAttempts) {
    for (let attempt = 0; attempt < maxFixAttempts; attempt++) {
      taskManager.incrementAttempt();
      taskManager.setStatus(LOOP_STATUS.FIXING);

      this.emit('update', {
        type: 'agent_message',
        agent: AGENT_ROLES.CODER,
        content: `Fix attempt ${attempt + 1}/${maxFixAttempts}. Errors:\n${truncate(errorOutput, 2000)}`,
      });

      const fixResult = await this._runCoder(
        { description: `Fix these errors:\n${truncate(errorOutput, 3000)}`, verifyCommand: '' },
        repoSummary,
        taskManager,
        executor
      );

      this.emit('update', {
        type: 'agent_message',
        agent: AGENT_ROLES.CODER,
        content: fixResult.thoughts,
        actions: fixResult.actions,
      });

      // Execute fix actions
      for (const action of fixResult.actions || []) {
        const result = await executor.execute(action);
        taskManager.recordAction(action, result.output);

        this.emit('update', {
          type: 'action_result',
          content: `${action.type}: ${result.success ? '✓' : '✗'} ${truncate(result.output, 300)}`,
        });

        if (!result.success) {
          taskManager.recordError(result.output);
        }
      }

      // Re-run build/test
      taskManager.setStatus(LOOP_STATUS.EXECUTING);
      const verifyResult = await executor.execute({
        type: 'run_command',
        command: 'npm run build 2>&1 || true',
      });

      if (verifyResult.success) {
        this.emit('update', { type: 'status', status: 'fixing', message: 'Errors resolved!' });
        return true;
      }

      errorOutput = verifyResult.output;
    }

    return false;
  }

  async _buildContext() {
    const { buildRepoSummary } = require('@codeforge/shared/utils');
    try {
      return await buildRepoSummary(this.projectPath);
    } catch (err) {
      return `Could not read repository: ${err.message}`;
    }
  }

  async _runSupervisor(task, repoSummary, taskManager) {
    const { modelRouter } = require('@codeforge/llm');
    const prompt = require('@codeforge/llm/prompts/supervisor.prompt');
    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole('supervisor'),
      messages: prompt.buildMessages(task, repoSummary, taskManager.getContext()),
    });
    return this._parseAgentResponse(response);
  }

  async _runCoder(step, repoSummary, taskManager, executor) {
    const { modelRouter } = require('@codeforge/llm');
    const prompt = require('@codeforge/llm/prompts/coder.prompt');

    // Gather context about recently changed files
    const recentFiles = taskManager.history
      .filter((h) => h.action.path)
      .slice(-5)
      .map((h) => h.action.path);

    let recentFileContents = '';
    for (const fp of recentFiles) {
      try {
        const result = await executor.execute({ type: 'read_file', path: fp });
        if (result.success) {
          recentFileContents += `\n--- ${fp} ---\n${result.output}\n`;
        }
      } catch {}
    }

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole('coder'),
      messages: prompt.buildMessages(step, repoSummary, taskManager.getContext(), recentFileContents),
    });
    return this._parseAgentResponse(response);
  }

  async _runReviewer(task, repoSummary, taskManager) {
    const { modelRouter } = require('@codeforge/llm');
    const prompt = require('@codeforge/llm/prompts/reviewer.prompt');

    const changesSummary = taskManager.history
      .map((h) => `[${h.action.type}] ${h.action.path || h.action.command || ''}`)
      .join('\n');

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole('reviewer'),
      messages: prompt.buildMessages(task, repoSummary, changesSummary),
    });
    return this._parseAgentResponse(response);
  }

  async _runDocs(task, taskManager) {
    const { modelRouter } = require('@codeforge/llm');
    const prompt = require('@codeforge/llm/prompts/docs.prompt');

    const changesSummary = taskManager.history
      .map((h) => `[${h.action.type}] ${h.action.path || h.action.command || ''}`)
      .join('\n');

    const response = await this.llmClient.chat({
      model: modelRouter.getModelForRole('docs'),
      messages: prompt.buildMessages(task, changesSummary),
    });
    return this._parseAgentResponse(response);
  }

  _parseAgentResponse(response) {
    const { parseJSON } = require('@codeforge/shared/utils');

    // If the response is already structured
    if (typeof response === 'object' && response !== null) {
      return response;
    }

    // Try parsing from text
    const parsed = parseJSON(response);
    if (parsed) {
      return {
        thoughts: parsed.thoughts || parsed.thought || '',
        actions: parsed.actions || [],
        plan: parsed.plan || [],
        issues: parsed.issues || [],
        summary: parsed.summary || '',
        buildCommand: parsed.buildCommand || '',
        maxFixAttempts: parsed.maxFixAttempts || 5,
      };
    }

    // Fallback: treat the whole response as thoughts
    return {
      thoughts: String(response),
      actions: [],
      plan: [],
      issues: [],
      summary: '',
    };
  }
}

function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '... [truncated]';
}

module.exports = WorkflowEngine;