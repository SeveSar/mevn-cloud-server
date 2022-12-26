const Router = require("express");
const router = Router();

const { check } = require("express-validator");

const userController = require("../controllers/userController");

router.post(
  "/registration",
  [
    check("email", "Uncorrect email").isEmail(),
    check(
      "password",
      "Password must be longer then  and shorter than 12"
    ).isLength({ min: 6, max: 12 }),
  ],
  userController.registration
);
router.post("/login", userController.login);

router.get("/logout", userController.logout);
router.get("/refresh", userController.refresh);
// router.get("/auth", authMiddleware, userController.auth);
module.exports = router;
