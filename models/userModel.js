const users = [];

const findByMobile = (mobile) => {
  return users.find(u => u.mobile === mobile);
};

const findById = (userId) => {
  return users.find(u => u.userId === userId);
};

const create = (userData) => {
  // Generate a simple userId if not provided
  if (!userData.userId) {
    userData.userId = `u_${users.length + 1}`;
  }
  users.push(userData);
  return userData;
};

const update = (userId, updateData) => {
  const index = users.findIndex(u => u.userId === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updateData };
    return users[index];
  }
  return null;
};

module.exports = {
  findByMobile,
  findById,
  create,
  update,
  users
};
