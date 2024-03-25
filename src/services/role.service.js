const Role = require("../models/role");

const RoleService = {
  async viewRoles() {
    try {
      const roles = await Role.find();
      return roles.map(({ _id, name }) => ({ _id, name }));
    } catch (error) {
      throw new Error(error);
    }
  },

  async findRoleByName(name) {
    try {
      return await Role.findOne({
        name: name,
      });
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = RoleService;
