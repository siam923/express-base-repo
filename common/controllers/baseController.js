// controllers/baseController.js
import pick from 'lodash/pick.js';
import qs from 'qs';
import catchAsync from '#src/utils/catchAsync.js';

class BaseController {
  constructor(service) {
    this.service = service;
    
    // Wrap each method with catchAsync when binding
    this.create = catchAsync(this.create.bind(this));
    this.getAll = catchAsync(this.getAll.bind(this));
    this.getById = catchAsync(this.getById.bind(this));
    this.update = catchAsync(this.update.bind(this));
    this.delete = catchAsync(this.delete.bind(this));
  }

  async create(req, res) {
    const options = this._buildOptions(req);
    const document = await this.service.create(req.body, options);
    res.status(201).json({ success: true, data: document });
  }

  async getAll(req, res) {
    const knownParams = ['page', 'limit', 'search', 'sort', 'order', 'select', 'populate', 'lean', 'includeDeleted'];
    const picked = pick(req.query, knownParams);

    // Parse nested filters
    const parsedQuery = qs.parse(req.query);
    const filters = Object.keys(parsedQuery)
      .filter(key => !knownParams.includes(key))
      .reduce((obj, key) => {
        obj[key] = parsedQuery[key];
        return obj;
      }, {});

    const queryParams = { ...picked, filters };
    const options = this._buildOptions(req);

    const result = await this.service.getAll(queryParams, options);
    res.status(200).json({ success: true, ...result });
  }

  async getById(req, res) {
    const options = this._buildOptions(req);
    const document = await this.service.getById(req.params.id, options);
    res.status(200).json({ success: true, data: document });
  }

  async getByQuery(req, res) {
    const options = this._buildOptions(req);
    const document = await this.service.getByQuery(req.query, options);
    res.status(200).json({ success: true, data: document });
  }

  async update(req, res) {
    const options = this._buildOptions(req);
    const document = await this.service.update(req.params.id, req.body, options);
    res.status(200).json({ success: true, data: document });
  }

  async delete(req, res) {
    const options = this._buildOptions(req);
    const result = await this.service.delete(req.params.id, options);
    res.status(200).json(result);
  }

  // Helper method to build common options
  _buildOptions(req) {
    return {
      context: { user: req.user, ...req.context } || {},
      user: req.user,
      select: req.query.select,
      populate: req.query.populate,
      lean: req.query.lean === 'true',
      includeDeleted: req.query.includeDeleted === 'true',
    };
  }
}

export default BaseController;