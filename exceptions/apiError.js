class ApiError extends Error {
  status;
  errors;
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
  static Unauthorized() {
    return new ApiError(401, "Unauthorized");
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
  static NotFound(message, errors = []) {
    return new ApiError(404, message, errors);
  }
}
module.exports = ApiError;
