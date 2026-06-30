class PlannerError extends Error {
  constructor(message, details = {}) {
    super(message);

    this.name = this.constructor.name;

    this.details = details;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

class PlannerParseError extends PlannerError {}

class PlannerValidationError extends PlannerError {}

class PlannerExecutionError extends PlannerError {}

class InvalidTaskError extends PlannerValidationError {}

class DuplicateTaskError extends PlannerValidationError {}

class DependencyError extends PlannerValidationError {}

class CircularDependencyError extends PlannerValidationError {}

module.exports = {

  PlannerError,

  PlannerParseError,

  PlannerValidationError,

  PlannerExecutionError,

  InvalidTaskError,

  DuplicateTaskError,

  DependencyError,

  CircularDependencyError

};