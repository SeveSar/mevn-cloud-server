// бизнес логика
const fs = require("fs");

const config = require("config");

class FileService {
  createDir(file) {
    return new Promise((resolve, reject) => {
      try {
        const filePath = this.getPath(file);
        // файл/папка по такому пути не существует
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
          return resolve({ message: "File was created" });
        } else {
          return reject({ message: "File already exists" });
        }
      } catch (e) {
        return reject({ message: "File error" });
      }
    });
  }
  deleteFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const path = this.getPath(file);
        if (file.type === "dir") {
          fs.rmdirSync(path);
        } else {
          fs.unlinkSync(path);
        }
        return resolve({ message: "File was deleted" });
      } catch (e) {
        return reject({ message: "Folder is not empty" });
      }
    });
  }
  // uploadFile(file) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const parent = await File.findOne({
  //         user: req.user.id,
  //         _id: req.body.parent,
  //       });
  //     } catch (e) {}
  //   });
  // }
  getPath(file) {
    return process.env.FILE_PATH + "\\" + file.user + "\\" + file.path;
  }
}

module.exports = new FileService();
