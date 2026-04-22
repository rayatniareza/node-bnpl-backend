const CreateCreditProductCommand = require('../commands/CreateCreditProductCommand');
const OrganizationRepository = require('../repositories/organizationRepository');
const CreditProductRepository = require('../repositories/creditProductRepository');
const CreditProductWhitelistRepository = require('../repositories/creditProductWhitelistRepository');
const UserOrganizationRepository = require('../repositories/userOrganizationRepository');

const createCreditProduct = async (req, res) => {
  const {
    title,
    providerId,
    type,
    minKycLevel,
    defaultAmount,
    maxAmount,
    installmentCount,
    tenorMonths,
    interestRate
  } = req.body;

  if (!title || !providerId || !type || minKycLevel === undefined || defaultAmount === undefined || maxAmount === undefined || installmentCount === undefined || tenorMonths === undefined || interestRate === undefined) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: "Missing required fields" });
  }

  try {
    const product = await CreateCreditProductCommand.execute(req.body);
    res.status(201).json({ productId: product.productId });
  } catch (error) {
    if (error.message === 'INVALID_INPUT') {
        return res.status(400).json({ code: 'INVALID_INPUT', message: "Invalid numeric values or type" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const addProductWhitelist = async (req, res) => {
  const { productId } = req.params;
  const { organizationIds } = req.body;

  if (!organizationIds || !Array.isArray(organizationIds)) {
    return res.status(400).json({ message: "organizationIds array is required" });
  }

  const product = await CreditProductRepository.findById(productId);
  if (!product) {
    return res.status(404).json({ code: 'PRODUCT_NOT_FOUND', message: "Product not found" });
  }

  if (product.type !== 'Whitelist') {
    return res.status(400).json({ code: 'INVALID_PRODUCT_TYPE', message: "Product is Public" });
  }

  const result = await CreditProductWhitelistRepository.addBatch(productId, organizationIds);
  res.status(200).json(result);
};

const assignUsersToOrganization = async (req, res) => {
  const { organizationId } = req.params;
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ code: 'EMPTY_LIST', message: "userIds array is required" });
  }

  if (userIds.length === 0) {
      return res.status(400).json({ code: 'EMPTY_LIST', message: "userIds array is empty" });
  }

  const org = await OrganizationRepository.findById(organizationId);
  if (!org) {
      return res.status(404).json({ code: 'ORGANIZATION_NOT_FOUND', message: "Organization not found" });
  }

  const result = await UserOrganizationRepository.assignBatch(organizationId, userIds);
  res.status(200).json({ organizationId, ...result });
};

const removeUsersFromOrganization = async (req, res) => {
  const { organizationId } = req.params;
  const { userIds } = req.body;

  const org = await OrganizationRepository.findById(organizationId);
  if (!org) {
    return res.status(404).json({ code: 'ORGANIZATION_NOT_FOUND', message: "Organization not found" });
  }

  const result = await UserOrganizationRepository.removeBatch(organizationId, userIds);
  res.status(200).json(result);
};

module.exports = {
  createCreditProduct,
  addProductWhitelist,
  assignUsersToOrganization,
  removeUsersFromOrganization
};
