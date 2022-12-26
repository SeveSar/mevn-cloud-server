const Router = require("express");
const router = new Router();
const UserModel = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");
router.get("", authMiddleware, async (req, res, next) => {
  const usersFromDB = await UserModel.find();
  return res.json(usersFromDB);
});

module.exports = router;
