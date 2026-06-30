const {
  TASK_PRIORITY,
  TASK_STATUS
} = require("./task-types");

class PlannerTask {

  constructor(data = {}) {

    this.id = data.id || "";

    this.type = data.type || "";

    this.description = data.description || "";

    this.priority = data.priority || TASK_PRIORITY.NORMAL;

    this.status = data.status || TASK_STATUS.PENDING;

    this.dependencies = Array.isArray(data.dependencies)
      ? [...data.dependencies]
      : [];

    this.files = Array.isArray(data.files)
      ? [...data.files]
      : [];

    this.metadata = data.metadata || {};

    this.result = null;

    this.error = null;

    this.createdAt = Date.now();

  }

}

class ExecutionPlan {

  constructor(data = {}) {

    this.goal = data.goal || "";

    this.reasoning = data.reasoning || "";

    this.repository = data.repository || "";

    this.createdAt = Date.now();

    this.estimatedTokens = data.estimatedTokens || 0;

    this.estimatedCost = data.estimatedCost || 0;

    this.tasks = [];

    if (Array.isArray(data.tasks)) {

      this.tasks = data.tasks.map(task => new PlannerTask(task));

    }

  }

  addTask(task) {

    this.tasks.push(new PlannerTask(task));

  }

  getTask(id) {

    return this.tasks.find(t => t.id === id);

  }

  getPendingTasks() {

    return this.tasks.filter(t => t.status === TASK_STATUS.PENDING);

  }

  getCompletedTasks() {

    return this.tasks.filter(t => t.status === TASK_STATUS.COMPLETED);

  }

}

module.exports = {

  PlannerTask,

  ExecutionPlan

};