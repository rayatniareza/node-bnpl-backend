const UserOrganization = require('../models/userOrganizationModel');
const User = require('../models/userModel');

class UserOrganizationRepository {
  async assignBatch(organizationId, userIds) {
    const assigned = [];
    const alreadyAssigned = [];
    const notFound = [];

    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (!user) {
        notFound.push(userId);
        continue;
      }

      const success = await UserOrganization.assign(userId, organizationId);
      if (success) {
        assigned.push(userId);
      } else {
        alreadyAssigned.push(userId);
      }
    }
    return { assigned, alreadyAssigned, notFound };
  }

  async removeBatch(organizationId, userIds) {
    const removed = [];
    const notFound = [];

    for (const userId of userIds) {
      const success = await UserOrganization.remove(userId, organizationId);
      if (success) {
        removed.push(userId);
      } else {
        notFound.push(userId);
      }
    }
    return { removed, notFound };
  }

  async findByUserId(userId) {
    return await UserOrganization.findByUserId(userId);
  }
}

module.exports = new UserOrganizationRepository();
