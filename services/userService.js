const UserDto = require("../dtos/userDto");
const tokenService = require("../services/tokenService");
const ApiError = require("../exceptions/apiError");
const User = require("../models/User");
const bcrtypt = require("bcryptjs");
class UserService {
  async registration(email, password) {
    const candidate = await User.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} already exists`);
    }
    const hashPassword = await bcrtypt.hash(password, 8);
    const user = new User({ email, password: hashPassword });
    await user.save();
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      tokens,
      userDto,
    };
  }
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.NotFound("User not found");
    }
    const isPassValid = bcrtypt.compareSync(password, user.password);
    if (!isPassValid) {
      throw ApiError.BadRequest("Invalid password");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      tokens,
      userDto,
    };
  }
  async logout(refreshToken) {
    const tokenData = await tokenService.removeToken(refreshToken);
    return tokenData;
  }
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.Unauthorized();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw ApiError.Unauthorized();
    }
    const user = await User.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      tokens,
      userDto,
    };
  }
}

module.exports = new UserService();
