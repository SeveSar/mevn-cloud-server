const fileService = require("../services/fileService");
const config = require("config");
const fs = require("fs");
const User = require("../models/User");
const File = require("../models/File");
const uuid = require("uuid");
const ApiError = require("../exceptions/apiError");
const path = require("path");

class FileController {
  async createDir(req, res, next) {
    try {
      const { name, type, parent } = req.body;
      if (!name) {
        return next(new ApiError(400, "Name must not be empty!"));
      }
      const file = new File({ name, type, parent, user: req.user.id });
      const parentFile = await File.findOne({ _id: parent });

      if (!parentFile) {
        file.path = name;
        await fileService.createDir(req, file);
      } else {
        file.path = `${parentFile.path}\\${file.name}`;
        await fileService.createDir(req, file);
        parentFile.childs.push(file._id);
        await parentFile.save();
      }
      await file.save();
      return res.json(file);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  async getFiles(req, res) {
    try {
      const { sort } = req.query;
      let files;
      switch (sort) {
        case "name":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ name: 1 });
          break;
        case "type":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ type: 1 });
          break;
        case "date":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ date: -1 });
          break;
        default:
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ date: -1 });
          break;
      }

      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Can not get files" });
    }
  }

  async uploadFile(req, res) {
    try {
      const file = req.files.file;
      const parent = await File.findOne({
        user: req.user.id,
        _id: req.body.parent,
      });

      const user = await User.findOne({ _id: req.user.id });

      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({ message: "There no space on the disk" });
      }
      user.usedSpace = user.usedSpace + file.size;

      let path;
      if (parent) {
        path = `${req.filePath}\\${user._id}\\${parent.path}\\${file.name}`;
      } else {
        path = `${req.filePath}\\${user._id}\\${file.name}`;
      }
      console.log(path, "path");
      if (fs.existsSync(path)) {
        return res.status(400).json({ message: "File already exist" });
      }
      file.mv(path);
      const type = file.name.split(".").pop();
      let filePath = file.name;
      if (parent) {
        filePath = parent.path + "\\" + file.name;
      }
      console.log(filePath, "filePath");
      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id,
      });
      // if (parent) {
      //   file.childs.push();
      // }
      await dbFile.save();
      await user.save();

      res.json(dbFile);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Upload error" });
    }
  }

  async downloadFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });

      let path = fileService.getPath(req, file);
      if (!fs.existsSync(path)) {
        return res.status(400).json({ message: "There is not file" });
      }

      return res.download(path, file.name);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Download error" });
    }
  }
  async deleteFile(req, res, next) {
    try {
      const id = req.query.id;
      const file = await File.findOne({ _id: id, user: req.user.id });
      if (!file) {
        return res.status(400).json({ message: "File not found" });
      }
      const removedChildsPromises = this.removeAllChilds(file);
      const removedFilefileDb = file.remove();
      const removedFilePhysicPromises = fileService.deleteFile(req, file);
      await Promise.all([
        removedChildsPromises,
        removedFilefileDb,
        removedFilePhysicPromises,
      ]);
      return res.json({ message: "File was deleted" });
    } catch (e) {
      next(e);
    }
  }
  async removeAllChilds(file) {
    if (!file.childs.length) return false;
    const descendants = [];
    const stack = [file];
    while (stack.length > 0) {
      const currentNode = stack.pop();
      const children = await File.find({
        _id: { $in: currentNode.childs },
      }).exec();
      children.forEach((child) => {
        descendants.push(child._id);
        if (child.childs.length > 0) {
          stack.push(child);
        }
      });
    }
    return File.deleteMany({ _id: { $in: descendants } }).exec();
  }
  async searchFile(req, res) {
    try {
      const searchName = req.query.search;
      let files = await File.find({ user: req.user.id });
      files = files.filter((file) => file.name.includes(searchName));

      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Search Error" });
    }
  }
  async uploadAvatar(req, res, next) {
    try {
      const file = req.files.file;
      const user = await User.findById(req.user.id);
      const avatarName = uuid.v4() + ".jpg";
      file.mv(path.resolve(__dirname, "../public") + "/" + avatarName);
      user.avatar = avatarName;
      await user.save();
      return res.json(user);
    } catch (e) {
      console.log(e);
      next(new ApiError(500, "Upload avatar error"));
    }
  }
  async deleteAvatar(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      fs.unlinkSync(path.resolve(__dirname, "../public") + "/" + user.avatar);
      user.avatar = null;
      await user.save();
      return res.json(user);
    } catch (e) {
      next(new ApiError(500, "Delete avatar error"));
    }
  }
}

module.exports = new FileController();
