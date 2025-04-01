// modules/job/service.js
import BaseService from '#src/common/services/baseService.js';
import Job from './model.js';

class JobService extends BaseService {
  constructor() {
    super(Job);
  }
  
  // Get jobs by status
  async getByStatus(status, options = {}) {
    return this.getAll(
      { 
        filters: { status },
        ...options
      },
      options
    );
  }
  
  // Search jobs by title or description
  async searchJobs(searchTerm, options = {}) {
    return this.getAll(
      {
        search: searchTerm,
        ...options
      },
      options
    );
  }
  
  // Get jobs within a date range
  async getJobsByDateRange(startDate, endDate, options = {}) {
    const filters = {
      createdAt: {}
    };
    
    if (startDate) {
      filters.createdAt.gte = new Date(startDate);
    }
    
    if (endDate) {
      filters.createdAt.lte = new Date(endDate);
    }
    
    return this.getAll(
      { 
        filters,
        ...options
      },
      options
    );
  }
  
  // Change job status
  async changeStatus(jobId, newStatus, options = {}) {
    if (!['draft', 'published', 'closed', 'archived'].includes(newStatus)) {
      throw new Error('Invalid job status');
    }
    
    return this.update(jobId, { status: newStatus }, options);
  }
}

export default new JobService();