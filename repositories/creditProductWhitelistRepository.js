const CreditProductWhitelist = require('../models/creditProductWhitelistModel');

class CreditProductWhitelistRepository {
  async addBatch(productId, organizationIds) {
    const added = [];
    const alreadyExists = [];
    for (const orgId of organizationIds) {
      const success = await CreditProductWhitelist.add(productId, orgId);
      if (success) {
        added.push(orgId);
      } else {
        alreadyExists.push(orgId);
      }
    }
    return { added, alreadyExists };
  }

  async findByProductId(productId) {
    return await CreditProductWhitelist.findByProductId(productId);
  }
}

module.exports = new CreditProductWhitelistRepository();
