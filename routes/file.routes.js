const Router = require("express");
const router = Router();
const authMiddleware = require("../middleware/auth.middleware");
const fileController = require("../controllers/fileController");

router.get("/search", authMiddleware, fileController.searchFile);
router.get("", authMiddleware, fileController.getFiles);
router.get("/download", authMiddleware, fileController.downloadFile);
router.post("", authMiddleware, fileController.createDir);
router.post("/upload", authMiddleware, fileController.uploadFile);
router.post("/avatar", authMiddleware, fileController.uploadAvatar);
router.delete("/", authMiddleware, fileController.deleteFile);
router.delete("/avatar", authMiddleware, fileController.deleteAvatar);

module.exports = router;
