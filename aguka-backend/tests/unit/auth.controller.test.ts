import { register, login, requestOtp, verifyPhone, refreshToken, logout, changePassword, forgotPassword, resetPassword } from '../../src/controllers/auth.controller.js';
import { authService } from '../../src/services/auth.service.js';
import { AppError, UnauthorizedError } from '../../src/middleware/error.middleware.js';

jest.mock('../../src/services/auth.service.js', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    requestOtp: jest.fn(),
    verifyPhone: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

describe('Auth Controller', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      headers: {},
      user: { sub: 'user-123', role: 'FARMER', exp: 1779399999 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register user and return 201', async () => {
      const userData = { phone: '+250123456789', password: 'pass123' };
      mockReq.body = userData;
      (authService.register as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      await register(mockReq, mockRes, mockNext);

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Registration failed');
      (authService.register as jest.Mock).mockRejectedValue(error);

      await register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const loginData = { phone: '+250123456789', password: 'pass123' };
      mockReq.body = loginData;
      (authService.login as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'token',
      });

      await login(mockReq, mockRes, mockNext);

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens with valid refresh token', async () => {
      mockReq.body = { refreshToken: 'valid-refresh-token' };
      (authService.refreshToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      });

      await refreshToken(mockReq, mockRes, mockNext);

      expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });

    it('should return 400 if refresh token not provided', async () => {
      mockReq.body = {};

      await refreshToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockReq.headers.authorization = 'Bearer access-token';
      (authService.logout as jest.Mock).mockResolvedValue({ message: 'Logged out' });

      await logout(mockReq, mockRes, mockNext);

      expect(authService.logout).toHaveBeenCalledWith('user-123', 'access-token', 1779399999);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Logged out' },
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      (authService.changePassword as jest.Mock).mockResolvedValue({ message: 'Password changed' });
      mockReq.body = { currentPassword: 'old', newPassword: 'new' };

      await changePassword(mockReq, mockRes, mockNext);

      expect(authService.changePassword).toHaveBeenCalledWith(
        'user-123',
        'old',
        'new'
      );
    });
  });
});
