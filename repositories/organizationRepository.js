const Organization = require('../models/organizationModel');

class OrganizationRepository {
  async findById(organizationId) {
    return await Organization.findById(organizationId);
  }

  async create(orgData) {
      return await Organization.create(orgData);
  }
}

module.exports = new OrganizationRepository();
