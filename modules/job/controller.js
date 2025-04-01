// modules/job/controller.js
import BaseController from '#src/common/controllers/baseController.js';
import jobService from './service.js';
import catchAsync from '#src/utils/catchAsync.js';

class JobController extends BaseController {
  constructor() {
    super(jobService);
    
    // Additional methods
    this.getByStatus = catchAsync(this.getByStatus.bind(this));
    this.searchJobs = catchAsync(this.searchJobs.bind(this));
    this.changeStatus = catchAsync(this.changeStatus.bind(this));
  }
  
  async getByStatus(req, res) {
    const { status } = req.params;
    const options = this._buildOptions(req);
    
    const result = await this.service.getByStatus(status, options);
    res.status(200).json({ success: true, ...result });
  }
  
  async searchJobs(req, res) {
    const { search } = req.query;
    const options = this._buildOptions(req);
    
    const result = await this.service.searchJobs(search, options);
    res.status(200).json({ success: true, ...result });
  }
  
  async changeStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const options = this._buildOptions(req);
    
    const result = await this.service.changeStatus(id, status, options);
    res.status(200).json({ success: true, data: result });
  }
  
  // Override the getAll method to handle date filters
  async getAll(req, res) {
    const { createdFrom, createdTo, ...rest } = req.query;
    const queryParams = { ...rest };
    
    // If date filters are provided, add them to the filters
    if (createdFrom || createdTo) {
      queryParams.filters = queryParams.filters || {};
      queryParams.filters.createdAt = {};
      
      if (createdFrom) {
        queryParams.filters.createdAt.gte = new Date(createdFrom);
      }
      
      if (createdTo) {
        queryParams.filters.createdAt.lte = new Date(createdTo);
      }
    }
    
    const options = this._buildOptions(req);
    const result = await this.service.getAll(queryParams, options);
    res.status(200).json({ success: true, ...result });
  }
}

export default new JobController();