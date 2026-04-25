const CreditProduct = require('../models/creditProductModel');

class CreditProductRepository {
  async create(productData) {
    return await CreditProduct.create(productData);
  }

  async findById(productId) {
    return await CreditProduct.findById(productId);
  }

  async findActive() {
    return await CreditProduct.findActive();
  }
}

module.exports = new CreditProductRepository();
