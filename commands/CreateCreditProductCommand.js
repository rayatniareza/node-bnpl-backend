const CreditProductRepository = require('../repositories/creditProductRepository');

class CreateCreditProductCommand {
  async execute(data) {
    // Validation is usually done before command or inside command
    if (data.maxAmount <= 0 || data.installmentCount <= 0 || !['Public', 'Whitelist'].includes(data.type)) {
      throw new Error('INVALID_INPUT');
    }

    return await CreditProductRepository.create({
      title: data.title,
      providerId: data.providerId,
      type: data.type,
      minKycLevel: data.minKycLevel,
      defaultAmount: data.defaultAmount,
      maxAmount: data.maxAmount,
      installmentCount: data.installmentCount,
      tenorMonths: data.tenorMonths,
      interestRate: data.interestRate
    });
  }
}

module.exports = new CreateCreditProductCommand();
