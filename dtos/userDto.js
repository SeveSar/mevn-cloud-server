class UserDto {
  email;
  id;
  diskSpace;
  usedSpace;
  avatar;
  constructor(model) {
    this.id = model._id;
    this.email = model.email;
    this.diskSpac = model.diskSpace;
    this.usedSpace = model.usedSpace;
    this.avatar = model.avatar;
  }
}

module.exports = UserDto;
