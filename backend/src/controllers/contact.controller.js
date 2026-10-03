import { contactService } from '../services/contact.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export const contactController = {
  async getAll(req, res, next) {
    try {
      const { contacts, pagination } = await contactService.getAll(req.user._id, req.query);
      return sendPaginated(res, contacts, pagination, 'Contacts retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const contact = await contactService.getById(req.user._id, req.params.id);
      if (!contact) {
        return sendError(res, 'Contact not found', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, contact);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const contact = await contactService.create(req.user._id, req.body);
      return sendSuccess(res, contact, 'Contact created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const contact = await contactService.update(req.user._id, req.params.id, req.body);
      if (!contact) {
        return sendError(res, 'Contact not found or unauthorized', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, contact, 'Contact updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await contactService.delete(req.user._id, req.params.id);
      if (!deleted) {
        return sendError(res, 'Contact not found or unauthorized', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, { id: req.params.id }, 'Contact deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async importContacts(req, res, next) {
    try {
      let dataToProcess;

      if (req.file) {
        dataToProcess = req.file.path;
      } else if (Array.isArray(req.body.contacts)) {
        dataToProcess = req.body.contacts;
      } else if (typeof req.body.csvString === 'string') {
        dataToProcess = req.body.csvString;
      } else {
        return sendError(res, 'Please provide a CSV file or a contacts array.', 400, 'INVALID_IMPORT_DATA');
      }

      const result = await contactService.importContacts(req.user._id, dataToProcess);
      return sendSuccess(res, result, 'Contacts imported successfully', 200, {
        imported: result.imported,
        failed: result.failed,
        duplicates: result.duplicates,
      });
    } catch (error) {
      next(error);
    }
  },
};
