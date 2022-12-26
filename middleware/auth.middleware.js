const ApiError = require("../exceptions/apiError");
const tokenService = require("../services/tokenService");
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return next(ApiError.Unauthorized());
    }
    const decoded = tokenService.validateAccessToken(token);

    if (!decoded) {
      return next(ApiError.Unauthorized());
    }
    req.user = decoded;
    next();
  } catch (e) {
    return next(ApiError.Unauthorized());
  }
};
