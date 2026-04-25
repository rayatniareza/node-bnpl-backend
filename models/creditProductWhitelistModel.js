const whitelists = [];

const add = async (productId, organizationId) => {
  const exists = whitelists.find(w => w.productId === productId && w.organizationId === organizationId);
  if (!exists) {
    whitelists.push({ productId, organizationId });
    return true;
  }
  return false;
};

const findByProductId = async (productId) => {
  return whitelists.filter(w => w.productId === productId).map(w => w.organizationId);
};

const findByOrganizationId = async (organizationId) => {
    return whitelists.filter(w => w.organizationId === organizationId).map(w => w.productId);
};

module.exports = {
  add,
  findByProductId,
  findByOrganizationId,
  whitelists
};
