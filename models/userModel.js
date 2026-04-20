const users = [];

const findByMobile = (mobile) => {
  return users.find(u => u.mobile === mobile);
};

const findById = (userId) => {
  return users.find(u => u.userId === userId);
};

const create = (userData) => {
  users.push(userData);
  return userData;
};

module.exports = {
  findByMobile,
  findById,
  create,
  users // Exporting users array for debugging or in-memory persistence if needed
};
