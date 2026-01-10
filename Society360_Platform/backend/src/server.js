require("dotenv").config();
const app = require("./app");
const { sequelize, Role } = require("./models");

const PORT = process.env.PORT || 5000;

const seedRoles = async () => {
  const roles = ["Resident", "Admin", "Staff"];
  for (let role of roles) {
    await Role.findOrCreate({ where: { name: role } });
  }
};

sequelize.sync({ alter: true }).then(async () => {
  console.log("Database connected");
  await seedRoles();
  console.log("Roles seeded");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
