class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Convert the error object to a JSON-like format
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
    };
  }
}

export { ApiError };
