const RoleService = require("../services/role.service");

exports.viewRoles = async (req, res) => {
  const roles = await RoleService.viewRoles();
  res.status(200).json(roles);
};
