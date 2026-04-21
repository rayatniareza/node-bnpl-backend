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
});
