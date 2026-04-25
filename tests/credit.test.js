require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const CreditProduct = require('../models/creditProductModel');
const UserOrganization = require('../models/userOrganizationModel');
const CreditProductWhitelist = require('../models/creditProductWhitelistModel');
const jwt = require('jsonwebtoken');

describe('Credit and Admin APIs', () => {
  let adminToken;
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';

    // Create users
    const u1 = User.create({ mobile: '09111111111', kycStatus: 'Verified', kycLevel: 1 });
    user1Id = u1.userId;
    user1Token = jwt.sign({ userId: user1Id }, process.env.JWT_SECRET);

    const u2 = User.create({ mobile: '09222222222', kycStatus: 'Verified', kycLevel: 0 });
    user2Id = u2.userId;
    user2Token = jwt.sign({ userId: user2Id }, process.env.JWT_SECRET);

    adminToken = jwt.sign({ userId: 'admin' }, process.env.JWT_SECRET);

    // Create an organization
    await Organization.create({ organizationId: 'org_1', name: 'Test Org' });
  });

  beforeEach(() => {
    // Clear models that are relevant for each test if needed
    // In this case, we might want to reset products and assignments for some tests
    CreditProduct.creditProducts.length = 0;
    UserOrganization.userOrganizations.length = 0;
    CreditProductWhitelist.whitelists.length = 0;
  });

  describe('Admin Credit Products', () => {
    it('should create a public credit product', async () => {
      const res = await request(app)
        .post('/api/admin/credit-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: "Public Product",
          providerId: "bank_1",
          type: "Public",
          minKycLevel: 1,
          defaultAmount: 1000,
          maxAmount: 2000,
          installmentCount: 3,
          tenorMonths: 3,
          interestRate: 0.04
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('productId');
    });

    it('should fail to create product with invalid input', async () => {
      const res = await request(app)
        .post('/api/admin/credit-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: "Invalid Product",
          maxAmount: -100 // Invalid
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('code', 'INVALID_INPUT');
    });
  });

  describe('Whitelist Management', () => {
    it('should add organization to product whitelist', async () => {
      const p = await CreditProduct.create({
        title: "Whitelist Product",
        type: "Whitelist",
        minKycLevel: 1
      });

      const res = await request(app)
        .post(`/api/admin/credit-products/${p.productId}/whitelist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          organizationIds: ["org_1"]
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.added).toContain("org_1");
    });

    it('should return error if product is Public', async () => {
        const p = await CreditProduct.create({
          title: "Public Product",
          type: "Public",
          minKycLevel: 1
        });

        const res = await request(app)
          .post(`/api/admin/credit-products/${p.productId}/whitelist`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            organizationIds: ["org_1"]
          });

        expect(res.statusCode).toEqual(400);
        expect(res.body.code).toEqual('INVALID_PRODUCT_TYPE');
      });
  });

  describe('Organization Assignment', () => {
    it('should assign users to organization', async () => {
      const res = await request(app)
        .post('/api/admin/organizations/org_1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [user1Id, user2Id]
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.assigned).toContain(user1Id);
      expect(res.body.assigned).toContain(user2Id);
    });

    it('should report notFound for non-existent users', async () => {
      const res = await request(app)
        .post('/api/admin/organizations/org_1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: ['non_existent']
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.notFound).toContain('non_existent');
    });

    it('should remove users from organization', async () => {
        await UserOrganization.assign(user1Id, 'org_1');

        const res = await request(app)
          .delete('/api/admin/organizations/org_1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            userIds: [user1Id]
          });

        expect(res.statusCode).toEqual(200);
        expect(res.body.removed).toContain(user1Id);
      });
  });

  describe('Eligibility Filtering', () => {
    it('should return eligible products for user', async () => {
      // 1. Public product level 1 (user1 eligible, user2 not)
      await CreditProduct.create({
        productId: 'cp_public_1',
        title: "Public Lvl 1",
        type: "Public",
        minKycLevel: 1,
        status: 'Active'
      });

      // 2. Public product level 0 (both eligible)
      await CreditProduct.create({
        productId: 'cp_public_0',
        title: "Public Lvl 0",
        type: "Public",
        minKycLevel: 0,
        status: 'Active'
      });

      // 3. Whitelist product level 1 for org_1 (user1 whitelisted, user2 whitelisted but level 0)
      await CreditProduct.create({
        productId: 'cp_white_1',
        title: "Whitelist Lvl 1",
        type: "Whitelist",
        minKycLevel: 1,
        status: 'Active'
      });
      await CreditProductWhitelist.add('cp_white_1', 'org_1');

      // Assign both to org_1
      await UserOrganization.assign(user1Id, 'org_1');
      await UserOrganization.assign(user2Id, 'org_1');

      // Check User 1 (Level 1, org_1)
      const res1 = await request(app)
        .get('/api/credits/products')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res1.statusCode).toEqual(200);
      const titles1 = res1.body.products.map(p => p.title);
      expect(titles1).toContain("Public Lvl 1");
      expect(titles1).toContain("Public Lvl 0");
      expect(titles1).toContain("Whitelist Lvl 1");

      // Check User 2 (Level 0, org_1)
      const res2 = await request(app)
        .get('/api/credits/products')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res2.statusCode).toEqual(200);
      const titles2 = res2.body.products.map(p => p.title);
      expect(titles2).not.toContain("Public Lvl 1");
      expect(titles2).toContain("Public Lvl 0");
      expect(titles2).not.toContain("Whitelist Lvl 1");
    });
  });
});
