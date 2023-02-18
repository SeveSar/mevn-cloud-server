const Router = require("express");
const router = Router();
const authMiddleware = require("../middleware/auth.middleware");
const fileController = require("../controllers/fileController");

router.get(
  "/search",
  authMiddleware,
  fileController.searchFile.bind(fileController)
);
router.get("", authMiddleware, fileController.getFiles.bind(fileController));
router.get(
  "/download",
  authMiddleware,
  fileController.downloadFile.bind(fileController)
);
router.post("", authMiddleware, fileController.createDir.bind(fileController));
router.post(
  "/upload",
  authMiddleware,
  fileController.uploadFile.bind(fileController)
);
router.post(
  "/avatar",
  authMiddleware,
  fileController.uploadAvatar.bind(fileController)
);
router.delete(
  "/",
  authMiddleware,
  fileController.deleteFile.bind(fileController)
);
router.delete(
  "/avatar",
  authMiddleware,
  fileController.deleteAvatar.bind(fileController)
);

module.exports = router;
