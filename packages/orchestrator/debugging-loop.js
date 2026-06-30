const { EventEmitter } = require('events');
const { LOOP_STATUS, MAX_ATTEMPTS } = require('@codeforge/shared/constants');
const TaskManager = require('./task-manager');
const ExecutionEngine = require('./execution-engine');
const WorkflowEngine = require('./workflow-engine');

/**
 * The core autonomous debugging loop.
 *
 * 1. User gives a task.
 * 2. Supervisor analyzes the repo and task.
 * 3. Planner decides what files/commands are needed.
 * 4. Coder edits files.
 * 5. Executor runs build/test commands.
 * 6. Error output is parsed.
 * 7. Coder fixes the errors.
 * 8. The loop repeats until success or maximum attempts are reached.
 * 9. Reviewer checks the final changes before completion.
 * 10. Documentation agent generates summaries if needed.
 */
class DebuggingLoop extends EventEmitter {
  constructor({ projectPath, llmClient, tools, maxAttempts }) {
    super();
    this.projectPath = projectPath;
    this.llmClient = llmClient;
    this.tools = tools;
    this.maxAttempts = maxAttempts || MAX_ATTEMPTS;
    this.aborted = false;

    this.taskManager = new TaskManager();
    this.executor = new ExecutionEngine({ projectPath, tools });
    this.workflow = new WorkflowEngine({ llmClient, tools, projectPath });

    // Forward all sub-component events upward
    this.taskManager.on('update', (data) => this.emit('update', data));
    this.workflow.on('update', (data) => this.emit('update', data));
  }

  /**
   * Run the full debugging loop for a user task.
   * @param {string} task - The user's task description
   * @returns {Promise<{success: boolean, reason?: string, duration: number}>}
   */
  async run(task) {
    this.aborted = false;
    this.taskManager.start(task);

    try {
      // ── Main Loop ──────────────────────────────────────────
      let overallSuccess = false;
      let overallReason = '';

      for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
        if (this.aborted) {
          this.emit('complete', { success: false, reason: 'Aborted by user.' });
          return { success: false, reason: 'Aborted by user.', duration: this.taskManager.getDuration() };
        }

        this.emit('update', {
          type: 'status',
          status: LOOP_STATUS.ANALYZING,
          message: `Attempt ${attempt + 1}/${this.maxAttempts}`,
        });

        // Run the workflow (plan → code → test → debug → review → docs)
        const result = await this.workflow.runWorkflow(
          task,
          this.taskManager,
          this.executor
        );

        if (result.success) {
          overallSuccess = true;
          break;
        } else {
          overallReason = result.reason;

          // Before retrying, ask supervisor if we should continue
          if (attempt < this.maxAttempts - 1) {
            this.emit('update', {
              type: 'agent_message',
              agent: 'supervisor',
              content: `Attempt ${attempt + 1} failed: ${overallReason}. Evaluating whether to retry...`,
            });

            const shouldRetry = await this._shouldRetry(task, attempt);
            if (!shouldRetry) {
              overallReason = overallReason || 'Supervisor decided not to retry.';
              break;
            }
          }
        }
      }

      const duration = this.taskManager.getDuration();
      const finalResult = {
        success: overallSuccess,
        reason: overallSuccess ? undefined : overallReason,
        duration,
      };

      this.taskManager.setStatus(overallSuccess ? LOOP_STATUS.SUCCESS : LOOP_STATUS.FAILED);
      this.emit('complete', finalResult);

      return finalResult;

    } catch (err) {
      this.taskManager.setStatus(LOOP_STATUS.FAILED);
      this.emit('update', { type: 'error', message: err.message });
      this.emit('complete', { success: false, reason: err.message, duration: this.taskManager.getDuration() });
      return { success: false, reason: err.message, duration: this.taskManager.getDuration() };
    }
  }

  /**
   * Ask the supervisor whether to retry after a failed attempt.
   * @returns {Promise<boolean>}
   */
  async _shouldRetry(task, attemptNumber) {
    try {
      const { modelRouter } = require('../providers');
      const prompt = require('@codeforge/llm/prompts/supervisor.prompt');

      const response = await this.llmClient.chat({
        model: modelRouter.getModelForRole('supervisor'),
        messages: [
          {
            role: 'system',
            content: 'You are a supervisor agent. Decide whether to retry a failed task. Respond with JSON: {"retry": true/false, "reason": "..."}',
          },
          {
            role: 'user',
            content: `Task: ${task}\nAttempt: ${attemptNumber + 1}\nMax attempts: ${this.maxAttempts}\nErrors so far: ${this.taskManager.errors.length}\nRecent errors:\n${this.taskManager.errors.slice(-3).map((e) => e.error).join('\n')}\n\nShould we retry?`,
          },
        ],
      });

      const { parseJSON } = require('@codeforge/shared/utils');
      const parsed = parseJSON(response);
      return parsed ? parsed.retry !== false : true; // Default to retry if parsing fails
    } catch {
      return true; // Default to retry on errors
    }
  }

  /**
   * Abort the current loop.
   */
  abort() {
    this.aborted = true;
    this.taskManager.setStatus(LOOP_STATUS.IDLE);
  }
}

/**
 * Factory function to create a new debugging loop.
 */
function createDebuggingLoop({ projectPath, llmClient, tools, maxAttempts }) {
  return new DebuggingLoop({ projectPath, llmClient, tools, maxAttempts });
}

module.exports = { DebuggingLoop, createDebuggingLoop };