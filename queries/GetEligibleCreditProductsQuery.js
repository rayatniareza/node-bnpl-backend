const CreditProductRepository = require('../repositories/creditProductRepository');
const UserOrganizationRepository = require('../repositories/userOrganizationRepository');
const CreditProductWhitelistRepository = require('../repositories/creditProductWhitelistRepository');
const User = require('../models/userModel');

class GetEligibleCreditProductsQuery {
  async execute(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const userKycLevel = user.kycLevel || 0;
    const userOrganizations = await UserOrganizationRepository.findByUserId(userId);

    const allActiveProducts = await CreditProductRepository.findActive();
    const eligibleProducts = [];

    // In a real DB, this would be a single query with joins.
    // Given the memory storage, we simulate the join logic here.
    for (const product of allActiveProducts) {
      if (userKycLevel < product.minKycLevel) {
        continue;
      }

      if (product.type === 'Public') {
        eligibleProducts.push(this._formatProduct(product));
      } else if (product.type === 'Whitelist') {
        const productWhitelistedOrgs = await CreditProductWhitelistRepository.findByProductId(product.productId);
        const isWhitelisted = userOrganizations.some(orgId => productWhitelistedOrgs.includes(orgId));

        if (isWhitelisted) {
          eligibleProducts.push(this._formatProduct(product));
        }
      }
    }

    return eligibleProducts;
  }

  _formatProduct(product) {
    return {
      productId: product.productId,
      title: product.title,
      maxAmount: product.maxAmount,
      installmentCount: product.installmentCount,
      type: product.type
    };
  }
}

module.exports = new GetEligibleCreditProductsQuery();
