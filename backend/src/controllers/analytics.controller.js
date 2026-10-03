import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/response.js';

export const analyticsController = {
  async getOverview(req, res, next) {
    try {
      const summary = await analyticsService.getSummary(req.user._id);
      return sendSuccess(res, summary, 'Analytics overview retrieved', 200, summary);
    } catch (error) {
      next(error);
    }
  },

  async getCharts(req, res, next) {
    try {
      const charts = await analyticsService.getCharts(req.user._id);
      return sendSuccess(res, charts, 'Analytics charts retrieved', 200, charts);
    } catch (error) {
      next(error);
    }
  },

  async getDashboard(req, res, next) {
    try {
      const dashboard = await analyticsService.getDashboard(req.user._id);
      return sendSuccess(res, dashboard, 'Dashboard data retrieved', 200, dashboard);
    } catch (error) {
      next(error);
    }
  },

  async getGenerationAnalytics(req, res, next) {
    try {
      const charts = await analyticsService.getCharts(req.user._id);
      return sendSuccess(res, { feedbackOverTime: charts.feedbackOverTime, toneDistribution: charts.toneDistribution });
    } catch (error) {
      next(error);
    }
  },

  async getMessageAnalytics(req, res, next) {
    try {
      const charts = await analyticsService.getCharts(req.user._id);
      return sendSuccess(res, {
        messagesOverTime: charts.messagesOverTime,
        channelDistribution: charts.channelDistribution,
        sendingOutcome: charts.sendingOutcome,
      });
    } catch (error) {
      next(error);
    }
  },
};
