const userService = require("../services/userService");
const fileService = require("../services/fileService");
const File = require("../models/File");
const ApiError = require("../exceptions/apiError");
const { validationResult } = require("express-validator");
class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Uncorrect request", errors));
      }
      const { email, password } = req.body;
      const { tokens, userDto } = await userService.registration(
        email,
        password
      );
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      fileService.createDir(req, new File({ user: userDto.id, name: "" }));
      return res.json({
        success: true,
        ...tokens,
        user: userDto,
      });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (typeof password === "number") {
        throw new ApiError(500, "Password must be a string");
      }
      const { tokens, userDto } = await userService.login(email, password);
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        ...tokens,
        user: userDto,
      });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const { tokens, userDto } = await userService.refresh(refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        success: true,
        ...tokens,
        user: userDto,
      });
    } catch (e) {
      console.log(e, "refresh");
      next(e);
    }
  }
}

module.exports = new UserController();
