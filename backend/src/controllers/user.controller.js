import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      return sendSuccess(res, { user: user.toJSON() }, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, phone, avatar } = req.body;
      const user = await User.findById(req.user._id);

      if (name) user.name = name;
      if (typeof phone !== 'undefined') user.phone = phone;
      if (avatar) user.avatar = avatar;

      await user.save();
      return sendSuccess(res, { user: user.toJSON() }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      user.preferences = {
        ...user.preferences,
        ...req.body,
      };

      await user.save();
      return sendSuccess(res, { preferences: user.preferences }, 'Preferences updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 'Incorrect current password.', 400, 'INVALID_PASSWORD');
      }

      user.password = newPassword;
      await user.save();

      return sendSuccess(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  },
};
