// src/services/baseService.js
import mongoose from 'mongoose';
import createError from 'http-errors';

class BaseService {
  constructor(Model) {
    this.Model = Model;
  }

  async create(data, options = {}) {
    const { context = {} } = options;

    try {
      let payload = {...data};

      // Add vendor ID for vendor-scoped operations
      if (context.accessLevel === 'vendor') {
        payload.vendorId = context.vendorId;
      }

      const document = new this.Model(payload);
      await document.save({ session: options.session });
      
      return this._fetchById(document._id, options);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async getAll(queryParams, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sort = '-createdAt',
        filters = {},
      } = queryParams;

      const { context = {} } = options;
      let query = {};

      // Full-text search
      if (search) {
        query.$text = { $search: search };
      }

      // Apply additional filters
      if (filters) {
        query = { ...query, ...this._parseFilters(filters) };
      }

      const paginateOptions = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: this._parseSort(sort),
        populate: this._parsePopulate(options.populate),
        select: options.select,
        lean: options.lean || false,
        session: options.session,
      };

      return this.Model.paginate(query, paginateOptions);
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async getById(id, options = {}) {
    try {
      const document = await this._fetchById(id, options);
      if (!document) throw createError(404, 'Document not found');
      return document;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async getByQuery(query, options = {}) {
    try {
      const document = await this.Model.findOne(query).exec();
      if (!document) throw createError(404, 'Document not found');
      return document;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async update(id, data, options = {}) {
    const { context = {} } = options;

    try {

      const query = this.Model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        session: options.session,
      });

      if (options.select) query.select(options.select);
      if (options.populate) query.populate(this._parsePopulate(options.populate));
      if (options.lean) query.lean();

      const document = await query.exec();
      if (!document) throw createError(404, 'Document not found');
      
      return document;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async delete(id, options = {}) {
    const { context = {} } = options;

    try {

      const document = await this.Model.findByIdAndDelete(id)
        .session(options.session)
        .exec();

      if (!document) throw createError(404, 'Document not found');
      
      return { success: true, message: 'Deleted successfully' };
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async deleteMany(query, options = {}) {
    const { context = {} } = options;

    try {
      const result = await this.Model.deleteMany(query).session(options.session);
      return { success: true, count: result.deletedCount, message: 'Deleted successfully' };
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async _fetchById(id, options = {}) {
    return this.Model.findById(id)
      .populate(this._parsePopulate(options.populate))
      .select(options.select)
      .lean(options.lean)
      .session(options.session)
      .exec();
  }

  _parseSort(sort) {
    if (!sort) return { createdAt: -1 };
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    return { [sortField]: sortOrder };
  }

  _parsePopulate(populate) {
    if (!populate) return [];
    if (typeof populate === 'string') {
      return populate.split(',').map(p => p.trim());
    }
    if (Array.isArray(populate)) {
      return populate.map(p => (typeof p === 'string' ? p.trim() : p));
    }
    return [populate];
  }

  _parseFilters(filters) {
    const parsedFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value instanceof mongoose.Types.ObjectId) {
        parsedFilters[key] = value;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([operator, val]) => {
          switch (operator) {
            case 'gte':
              parsedFilters[key] = { ...parsedFilters[key], $gte: val };
              break;
            case 'lte':
              parsedFilters[key] = { ...parsedFilters[key], $lte: val };
              break;
            case 'regex':
              parsedFilters[key] = { ...parsedFilters[key], $regex: val, $options: 'i' };
              break;
            case 'in':
              parsedFilters[key] = { ...parsedFilters[key], $in: val };
              break;
            case 'nin':
              parsedFilters[key] = { ...parsedFilters[key], $nin: val };
              break;
            case 'or':
              parsedFilters[key] = { $or: val };
              break;
            case 'and':
              parsedFilters[key] = { $and: val };
              break;
            default:
              parsedFilters[key] = val;
          }
        });
      } else {
        parsedFilters[key] = value;
      }
    });
    return parsedFilters;
  }

  _handleError(error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(err => err.message);
      return createError(400, `Validation Error: ${messages.join(', ')}`);
    }
    if (error instanceof mongoose.Error.CastError) {
      return createError(400, `Invalid ${error.path}: ${error.value}`);
    }
    if (error.status && error.message) {
      return error;
    }
    return createError(500, error.message || 'Internal Server Error');
  }

  // Transaction methods
  async startTransaction() {
    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
  }

  async commitTransaction(session) {
    await session.commitTransaction();
    session.endSession();
  }

  async abortTransaction(session) {
    await session.abortTransaction();
    session.endSession();
  }
}

export default BaseService;