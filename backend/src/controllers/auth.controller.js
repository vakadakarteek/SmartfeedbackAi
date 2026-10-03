import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return sendError(res, 'An account with this email already exists.', 409, 'EMAIL_EXISTS');
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
      });

      const token = signToken({ id: user._id, email: user.email });

      return sendSuccess(
        res,
        {
          token,
          user: user.toJSON(),
        },
        'Registration successful',
        201,
        { token, user: user.toJSON() }
      );
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return sendError(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
      }

      const token = signToken({ id: user._id, email: user.email });

      return sendSuccess(
        res,
        {
          token,
          user: user.toJSON(),
        },
        'Login successful',
        200,
        { token, user: user.toJSON() }
      );
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      return sendSuccess(res, { user: req.user }, 'Current user retrieved');
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      return sendSuccess(
        res,
        { message: 'If that email exists in our system, a password reset link has been dispatched.' },
        'Password reset request received'
      );
    } catch (error) {
      next(error);
    }
  },
};
