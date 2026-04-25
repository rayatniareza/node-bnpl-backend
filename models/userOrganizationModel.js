const userOrganizations = [];

const assign = async (userId, organizationId) => {
  const exists = userOrganizations.find(uo => uo.userId === userId && uo.organizationId === organizationId);
  if (!exists) {
    userOrganizations.push({ userId, organizationId });
    return true;
  }
  return false;
};

const remove = async (userId, organizationId) => {
  const index = userOrganizations.findIndex(uo => uo.userId === userId && uo.organizationId === organizationId);
  if (index !== -1) {
    userOrganizations.splice(index, 1);
    return true;
  }
  return false;
};

const findByUserId = async (userId) => {
  return userOrganizations.filter(uo => uo.userId === userId).map(uo => uo.organizationId);
};

const findByOrganizationId = async (organizationId) => {
  return userOrganizations.filter(uo => uo.organizationId === organizationId).map(uo => uo.userId);
};

module.exports = {
  assign,
  remove,
  findByUserId,
  findByOrganizationId,
  userOrganizations
};
