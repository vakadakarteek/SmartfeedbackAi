import { feedbackService } from '../services/feedback.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export const feedbackController = {
  async generate(req, res, next) {
    try {
      const result = await feedbackService.generate(req.user._id, req.body);
      return sendSuccess(
        res,
        result,
        'Feedback drafts generated successfully',
        201,
        {
          items: result.feedback,
          sessionId: result.sessionId,
        }
      );
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { items, pagination } = await feedbackService.getAll(req.user._id, req.query);
      return sendPaginated(res, items, pagination, 'Feedback drafts retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const feedback = await feedbackService.getById(req.user._id, req.params.id);
      if (!feedback) {
        return sendError(res, 'Feedback not found', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, feedback);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await feedbackService.update(req.user._id, req.params.id, req.body);
      if (!updated) {
        return sendError(res, 'Feedback not found or unauthorized', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, updated, 'Feedback updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const approved = await feedbackService.approve(req.user._id, req.params.id);
      if (!approved) {
        return sendError(res, 'Feedback not found or unauthorized', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, approved, 'Feedback approved successfully');
    } catch (error) {
      next(error);
    }
  },

  async regenerate(req, res, next) {
    try {
      const regenerated = await feedbackService.regenerateOne(req.user._id, req.params.id, req.body);
      if (!regenerated) {
        return sendError(res, 'Feedback not found or unauthorized', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, regenerated, 'Feedback regenerated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await feedbackService.delete(req.user._id, req.params.id);
      if (!deleted) {
        return sendError(res, 'Feedback not found or unauthorized', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, { id: req.params.id }, 'Feedback deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
