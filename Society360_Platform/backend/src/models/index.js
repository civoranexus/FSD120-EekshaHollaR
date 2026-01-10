const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const Role = require("./role.model")(sequelize, Sequelize);
const User = require("./user.model")(sequelize, Sequelize);

Role.hasMany(User);
User.belongsTo(Role);

module.exports = {
  sequelize,
  Role,
  User,
};
