import { Contact } from '../models/Contact.js';
import { parseCSV } from '../utils/csvParser.js';

export const contactService = {
  async getAll(userId, query = {}) {
    const {
      page = 1,
      limit = 50,
      search = '',
      status,
      tag,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = { userId };

    if (status) filter.status = status;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limitNum),
      Contact.countDocuments(filter),
    ]);

    return {
      contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  },

  async getById(userId, id) {
    return Contact.findOne({ _id: id, userId });
  },

  async create(userId, data) {
    return Contact.create({
      userId,
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      status: data.status || 'Active',
      isActive: data.status !== 'Inactive' && data.isActive !== false,
    });
  },

  async update(userId, id, data) {
    const contact = await Contact.findOne({ _id: id, userId });
    if (!contact) return null;

    if (data.name) contact.name = data.name;
    if (typeof data.phone !== 'undefined') contact.phone = data.phone;
    if (typeof data.email !== 'undefined') contact.email = data.email;
    if (Array.isArray(data.tags)) contact.tags = data.tags;
    if (data.status) {
      contact.status = data.status;
      contact.isActive = data.status === 'Active';
    }
    if (typeof data.isActive === 'boolean') {
      contact.isActive = data.isActive;
      contact.status = data.isActive ? 'Active' : 'Inactive';
    }

    await contact.save();
    return contact;
  },

  async delete(userId, id) {
    const result = await Contact.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  },

  async importContacts(userId, rawData) {
    let records = [];
    let failed = 0;
    let duplicates = 0;

    if (Array.isArray(rawData)) {
      const seen = new Set();
      for (const item of rawData) {
        if (!item.name || (!item.email && !item.phone)) {
          failed++;
          continue;
        }
        const key = item.email ? item.email.toLowerCase() : item.phone;
        if (seen.has(key)) {
          duplicates++;
          continue;
        }
        seen.add(key);
        records.push({
          name: item.name.trim(),
          email: (item.email || '').trim().toLowerCase(),
          phone: (item.phone || '').trim(),
          tags: Array.isArray(item.tags) ? item.tags : [],
        });
      }
    } else {
      const parsed = await parseCSV(rawData);
      records = parsed.records;
      failed = parsed.failed;
      duplicates = parsed.duplicates;
    }

    let imported = 0;
    for (const record of records) {
      const existing = await Contact.findOne({
        userId,
        $or: [
          record.email ? { email: record.email } : null,
          record.phone ? { phone: record.phone } : null,
        ].filter(Boolean),
      });

      if (existing) {
        duplicates++;
        continue;
      }

      await Contact.create({
        userId,
        name: record.name,
        email: record.email,
        phone: record.phone,
        tags: record.tags,
        status: 'Active',
        isActive: true,
      });
      imported++;
    }

    return {
      success: true,
      imported,
      failed,
      duplicates,
      totalProcessed: records.length + failed + duplicates,
    };
  },
};
