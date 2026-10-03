import { Feedback } from '../models/Feedback.js';
import { Generation } from '../models/Generation.js';
import { generateAIFeedback } from './ai/gemini.service.js';

export const feedbackService = {
  async generate(userId, params) {
    const {
      topic,
      description = '',
      feedbackCount = 5,
      count,
      tone = 'Professional',
      length = 'medium',
      language = 'English',
      style = 'balanced',
      keywords = [],
      avoidTopics = [],
      audience = 'general',
    } = params;

    const targetCount = parseInt(feedbackCount || count || 5, 10);

    const generation = await Generation.create({
      userId,
      topic,
      description,
      feedbackCount: targetCount,
      tone,
      length,
      language,
      style,
      keywords,
      avoidTopics,
      audience,
      status: 'processing',
    });

    try {
      const aiResult = await generateAIFeedback({
        topic,
        description,
        feedbackCount: targetCount,
        tone,
        length,
        language,
        style,
        keywords,
        avoidTopics,
        audience,
      });

      const feedbackDocs = await Promise.all(
        aiResult.feedback.map((item) =>
          Feedback.create({
            userId,
            generationId: generation._id,
            content: item.content || item.text,
            topic,
            description,
            tone,
            length,
            language,
            style,
            status: 'generated',
            isEdited: false,
            isSelected: false,
          })
        )
      );

      generation.status = 'completed';
      generation.model = aiResult.model;
      generation.generationDuration = aiResult.generationDuration;
      await generation.save();

      return {
        generation,
        feedback: feedbackDocs,
        items: feedbackDocs,
        sessionId: generation._id.toString(),
        mode: aiResult.mode,
      };
    } catch (error) {
      generation.status = 'failed';
      await generation.save();
      throw error;
    }
  },

  async getAll(userId, query = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      tone,
      topic,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = { userId };

    if (status) filter.status = status;
    if (tone) filter.tone = new RegExp(tone, 'i');
    if (topic) filter.topic = new RegExp(topic, 'i');
    if (search) {
      filter.$or = [
        { content: new RegExp(search, 'i') },
        { topic: new RegExp(search, 'i') },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limitNum),
      Feedback.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  },

  async getById(userId, id) {
    return Feedback.findOne({ _id: id, userId });
  },

  async update(userId, id, updates) {
    const feedback = await Feedback.findOne({ _id: id, userId });
    if (!feedback) return null;

    if (updates.content || updates.text) {
      feedback.content = updates.content || updates.text;
      feedback.isEdited = true;
      feedback.status = 'edited';
    }

    if (updates.status) {
      feedback.status = updates.status;
    }

    if (typeof updates.isSelected === 'boolean') {
      feedback.isSelected = updates.isSelected;
    }

    await feedback.save();
    return feedback;
  },

  async approve(userId, id) {
    const feedback = await Feedback.findOne({ _id: id, userId });
    if (!feedback) return null;

    feedback.status = 'approved';
    await feedback.save();
    return feedback;
  },

  async regenerateOne(userId, id, params = {}) {
    const feedback = await Feedback.findOne({ _id: id, userId });
    if (!feedback) return null;

    const topic = params.topic || feedback.topic;
    const tone = params.tone || feedback.tone;
    const length = params.length || feedback.length;
    const language = params.language || feedback.language;

    const aiResult = await generateAIFeedback({
      topic,
      description: feedback.description,
      feedbackCount: 1,
      tone,
      length,
      language,
      style: feedback.style,
    });

    const newContent = aiResult.feedback[0]?.content || feedback.content;
    feedback.content = newContent;
    feedback.tone = tone;
    feedback.length = length;
    feedback.language = language;
    feedback.isEdited = false;
    feedback.status = 'generated';
    await feedback.save();

    return feedback;
  },

  async delete(userId, id) {
    const result = await Feedback.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  },
};
