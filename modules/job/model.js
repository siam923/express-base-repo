import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const JobSchema = new mongoose.Schema(
  {
    // Internal reference ID for the job
    referenceId: { 
      type: String, 
      unique: true,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase() 
    },
    
    // Job details
    title: { 
      type: String, 
      required: function() { return this.status !== 'draft'; } 
    },
    description: { 
      type: String,
      required: function() { return this.status !== 'draft'; } 
    },
    
    // Job status
    status: { 
      type: String, 
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'draft' 
    },
    
    // Job identification
    jobCode: { type: String },
    jobId: { type: String },
    
    // Source information
    source: { 
      type: String, 
      default: 'other'
    },

    department: {
      type: String,
      default: 'No Department'
    },

    sender: {
      type: String,
      default: 'No Sender'
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // Recruiter information
    primaryRecruiter: { 
      type: String,  // Could be an email, company name, or person's name
    },
    
    // Skills required for the job
    skills: [{
      skillType: { type: String },  // Format: "skillName~priority~yearsOfExperience~isMandatory~skillLevel"
      name: { type: String },       // Parsed from skillType
      isMandatory: { type: Boolean, default: true },
    }],
    
    // Application details
    applicationEmail: { type: String },
    applicationDeadline: { type: Date },
  },
  { timestamps: true }
);

// Add indexes for better performance
JobSchema.index({ title: 'text', description: 'text' });
JobSchema.index({ status: 1 });
JobSchema.index({ createdAt: -1 });

// Add pagination support
JobSchema.plugin(mongoosePaginate);

// Pre-save hook to parse skillType string if provided in original format
JobSchema.pre('save', function(next) {
  if (this.skills && this.skills.length > 0) {
    this.skills.forEach(skill => {
      if (skill.skillType && !skill.name) {
        const parts = skill.skillType.split('~');
        if (parts.length >= 1) {
          skill.name = parts[0];
          skill.isMandatory = parts.length >= 4 ? parts[3] === '1' : true;
        }
      }
    });
  }
  next();
});

const Job = mongoose.models.Job  || mongoose.model('Job', JobSchema);
export default Job;