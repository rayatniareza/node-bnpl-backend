const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');

describe('Auth APIs', () => {
  beforeEach(() => {
    // Clear in-memory storage
    User.users.length = 0;
  });

  describe('POST /api/auth/request-otp', () => {
    it('should return 200 and expiresIn for valid mobile', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ mobile: '09123456789' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('expiresIn', 120);
    });

    it('should return 400 for invalid mobile format', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ mobile: '12345' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid mobile number format');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    const mobile = '09123456789';
    const code = '123456';

    it('should verify OTP and return accessToken', async () => {
      // Manually save OTP to mock request-otp
      Otp.saveOtp(mobile, code, 120);

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile, code });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('isNewUser', true);
    });

    it('should return 401 for incorrect OTP', async () => {
      Otp.saveOtp(mobile, code, 120);

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile, code: '654321' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid OTP or mobile');
    });

    it('should return 401 for expired OTP', async () => {
      // Save with 0 seconds expiry
      Otp.saveOtp(mobile, code, -1);

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile, code });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid OTP or mobile');
    });
  });
});
