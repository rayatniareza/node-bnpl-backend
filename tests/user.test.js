require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

describe('User Profile APIs', () => {
  let token;
  const userId = 'u_1';
  const mobile = '09123456789';

  beforeEach(() => {
    User.users.length = 0;
    User.create({ userId, mobile });
    token = jwt.sign({ userId, mobile }, process.env.JWT_SECRET || 'supersecretkey');
  });

  describe('POST /api/users/profile', () => {
    it('should create profile successfully', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nationalId: '1234567890',
          birthDate: '1990-01-01'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('userId', userId);
      expect(res.body).toHaveProperty('kycStatus', 'Pending');
      expect(res.body).toHaveProperty('kycLevel', 0);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nationalId: '1234567890'
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should return 400 for invalid nationalId', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nationalId: '123',
          birthDate: '1990-01-01'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid nationalId format');
    });

    it('should return 401 for missing token', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .send({
          nationalId: '1234567890',
          birthDate: '1990-01-01'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/users/me', () => {
    it('should return user status for authenticated user', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        userId: userId,
        mobile: mobile,
        kycStatus: 'Pending',
        kycLevel: 0,
        isEligibleForCredit: false
      });
    });

    it('should return isEligibleForCredit: true when KYC is Verified and level >= 1', async () => {
      User.update(userId, { kycStatus: 'Verified', kycLevel: 1 });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.kycStatus).toEqual('Verified');
      expect(res.body.kycLevel).toEqual(1);
      expect(res.body.isEligibleForCredit).toEqual(true);
    });

    it('should return isEligibleForCredit: false when KYC is Verified but level is 0', async () => {
      User.update(userId, { kycStatus: 'Verified', kycLevel: 0 });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.kycStatus).toEqual('Verified');
      expect(res.body.kycLevel).toEqual(0);
      expect(res.body.isEligibleForCredit).toEqual(false);
    });

    it('should return isEligibleForCredit: false when KYC is Rejected', async () => {
      User.update(userId, { kycStatus: 'Rejected', kycLevel: 1 });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.kycStatus).toEqual('Rejected');
      expect(res.body.isEligibleForCredit).toEqual(false);
    });

    it('should return 404 if user is not found in database but token is valid', async () => {
      User.users.length = 0; // Clear users

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toEqual(401);
    });
  });
});
