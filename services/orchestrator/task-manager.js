const { EventEmitter } = require('events');
const { LOOP_STATUS } = require('@codeforge/shared/constants');

/**
 * Manages the task lifecycle for an agent run.
 * Tracks the current step, plan, history, and status.
 */
class TaskManager extends EventEmitter {
  constructor() {
    super();
    this.task = null;
    this.plan = [];
    this.currentStep = 0;
    this.status = LOOP_STATUS.IDLE;
    this.history = [];        // All actions taken
    this.errors = [];         // All errors encountered
    this.attemptCount = 0;
    this.startTime = null;
  }

  start(task) {
    this.task = task;
    this.status = LOOP_STATUS.ANALYZING;
    this.history = [];
    this.errors = [];
    this.attemptCount = 0;
    this.startTime = Date.now();
    this.emit('update', { type: 'status', status: this.status, message: `Starting task: ${task}` });
  }

  setPlan(plan) {
    this.plan = plan;
    this.currentStep = 0;
    this.emit('update', { type: 'status', status: LOOP_STATUS.PLANNING, message: `Plan created with ${plan.length} steps` });
  }

  advanceStep() {
    this.currentStep++;
  }

  setStatus(status) {
    this.status = status;
    this.emit('update', { type: 'status', status });
  }

  recordAction(action, result) {
    this.history.push({
      step: this.currentStep,
      action,
      result: typeof result === 'string' ? result : JSON.stringify(result),
      timestamp: Date.now(),
    });
  }

  recordError(error) {
    this.errors.push({
      step: this.currentStep,
      error,
      timestamp: Date.now(),
    });
  }

  incrementAttempt() {
    this.attemptCount++;
  }

  getDuration() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  getContext() {
    // Build a summary of everything that's happened so far
    let context = '';

    if (this.task) {
      context += `Task: ${this.task}\n`;
    }
    if (this.plan.length > 0) {
      context += `\nPlan:\n`;
      for (let i = 0; i < this.plan.length; i++) {
        const marker = i < this.currentStep ? '✓' : i === this.currentStep ? '→' : '○';
        context += `  ${marker} Step ${i + 1}: ${this.plan[i].description}\n`;
      }
    }
    if (this.errors.length > 0) {
      context += `\nErrors encountered:\n`;
      for (const err of this.errors.slice(-5)) {
        context += `  - ${err.error}\n`;
      }
    }
    if (this.history.length > 0) {
      context += `\nRecent actions:\n`;
      for (const entry of this.history.slice(-10)) {
        context += `  - [${entry.action.type}] ${entry.action.path || entry.action.command || ''}\n`;
      }
    }

    return context;
  }

  reset() {
    this.task = null;
    this.plan = [];
    this.currentStep = 0;
    this.status = LOOP_STATUS.IDLE;
    this.history = [];
    this.errors = [];
    this.attemptCount = 0;
    this.startTime = null;
  }
}

module.exports = TaskManager;