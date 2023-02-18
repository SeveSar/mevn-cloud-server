// бизнес логика
const fs = require("fs/promises");
const ApiError = require("../exceptions/apiError");
const config = require("config");

const checkIsExist = async (path) => {
  return fs
    .stat(path)
    .then(() => true)
    .catch(() => false);
};

class FileService {
  async createDir(req, file) {
    const filePath = this.getPath(req, file);
    const isFileExist = await checkIsExist(filePath);
    if (!isFileExist) {
      await fs.mkdir(filePath).catch(() => {
        throw new ApiError(400, "File create Error");
      });
      return { message: "File was created" };
    } else {
      throw new ApiError(400, "File already exists");
    }
  }
  async deleteFile(req, file) {
    try {
      const path = this.getPath(req, file);
      if (file.type === "dir") {
        await fs.rm(path, { recursive: true, force: true });
      } else {
        await fs.unlink(path);
      }
      return { message: "File was deleted" };
    } catch (e) {
      console.log(e);
      throw new ApiError(500, "Error delete file");
    }
  }

  getPath(req, file) {
    return req.filePath + "\\" + file.user + "\\" + file.path;
  }
}

module.exports = new FileService();
