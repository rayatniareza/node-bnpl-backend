const organizations = [];

const create = async (orgData) => {
  const organizationId = orgData.organizationId || `org_${organizations.length + 1}`;
  const newOrg = {
    organizationId,
    ...orgData,
    createdAt: new Date()
  };
  organizations.push(newOrg);
  return newOrg;
};

const findById = async (organizationId) => {
  return organizations.find(o => o.organizationId === organizationId);
};

module.exports = {
  create,
  findById,
  organizations
};
