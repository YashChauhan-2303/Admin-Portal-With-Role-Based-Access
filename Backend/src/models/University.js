const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    minlength: [2, 'University name must be at least 2 characters'],
    maxlength: [100, 'University name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['public', 'private', 'community'],
      message: 'Type must be either public, private, or community'
    },
    required: [true, 'University type is required']
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'United States',
      maxlength: [50, 'Country name cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    fax: {
      type: String,
      trim: true
    }
  },
  enrollment: {
    undergraduate: {
      type: Number,
      min: [0, 'Undergraduate enrollment cannot be negative'],
      default: 0
    },
    graduate: {
      type: Number,
      min: [0, 'Graduate enrollment cannot be negative'],
      default: 0
    },
    total: {
      type: Number,
      min: [0, 'Total enrollment cannot be negative']
    }
  },
  founded: {
    type: Number,
    min: [1000, 'Founded year must be a valid year'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  accreditation: {
    status: {
      type: String,
      enum: ['accredited', 'candidate', 'not-accredited', 'unknown'],
      default: 'unknown'
    },
    agencies: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      validUntil: {
        type: Date
      }
    }]
  },
  rankings: {
    national: {
      rank: Number,
      source: String,
      year: Number
    },
    global: {
      rank: Number,
      source: String,
      year: Number
    }
  },
  tuition: {
    inState: {
      undergraduate: Number,
      graduate: Number
    },
    outOfState: {
      undergraduate: Number,
      graduate: Number
    },
    international: {
      undergraduate: Number,
      graduate: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    academicYear: String
  },
  programs: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['certificate', 'associate', 'bachelor', 'master', 'doctoral', 'professional'],
      required: true
    },
    department: String,
    duration: String,
    credits: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  facilities: {
    libraries: Number,
    laboratories: Number,
    dormitories: Number,
    sportsComplexes: Number,
    researchCenters: Number,
    other: [String]
  },
  demographics: {
    studentToFacultyRatio: String,
    internationalStudentPercentage: Number,
    graduationRate: Number,
    employmentRate: Number
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'closed'],
    default: 'active'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logo: {
    type: String, // URL to logo image
    default: null
  },
  images: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['campus', 'building', 'event', 'other'],
      default: 'other'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastModified: {
    field: String,
    date: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and search
universitySchema.index({ name: 1 });
universitySchema.index({ type: 1 });
universitySchema.index({ 'location.state': 1 });
universitySchema.index({ 'location.city': 1 });
universitySchema.index({ status: 1 });
universitySchema.index({ createdAt: 1 });
universitySchema.index({ 'enrollment.total': 1 });
universitySchema.index({ tags: 1 });

// Text index for search functionality
universitySchema.index({
  name: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text',
  tags: 'text'
});

// Geospatial index for location-based queries
universitySchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for full location string
universitySchema.virtual('fullLocation').get(function() {
  const parts = [this.location.city, this.location.state];
  if (this.location.country && this.location.country !== 'United States') {
    parts.push(this.location.country);
  }
  return parts.join(', ');
});

// Virtual for total enrollment calculation
universitySchema.virtual('enrollment.calculated').get(function() {
  return (this.enrollment.undergraduate || 0) + (this.enrollment.graduate || 0);
});

// Pre-save middleware to calculate total enrollment
universitySchema.pre('save', function(next) {
  if (this.enrollment) {
    this.enrollment.total = (this.enrollment.undergraduate || 0) + (this.enrollment.graduate || 0);
  }
  next();
});

// Pre-save middleware for audit tracking
universitySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModified = {
      date: new Date(),
      user: this.updatedBy
    };
  }
  next();
});

// Static method to get university statistics
universitySchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUniversities: { $sum: 1 },
        activeUniversities: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        inactiveUniversities: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        pendingUniversities: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        publicCount: { $sum: { $cond: [{ $eq: ['$type', 'public'] }, 1, 0] } },
        privateCount: { $sum: { $cond: [{ $eq: ['$type', 'private'] }, 1, 0] } },
        communityCount: { $sum: { $cond: [{ $eq: ['$type', 'community'] }, 1, 0] } },
        totalEnrollment: { $sum: '$enrollment.total' },
        avgEnrollment: { $avg: '$enrollment.total' }
      }
    }
  ]);

  const stateDistribution = await this.aggregate([
    { $group: { _id: '$location.state', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const recentlyAdded = await this.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  });

  const result = stats[0] || {
    totalUniversities: 0,
    activeUniversities: 0,
    inactiveUniversities: 0,
    pendingUniversities: 0,
    publicCount: 0,
    privateCount: 0,
    communityCount: 0,
    totalEnrollment: 0,
    avgEnrollment: 0
  };

  return {
    totalUniversities: result.totalUniversities,
    statusDistribution: {
      active: result.activeUniversities,
      inactive: result.inactiveUniversities,
      pending: result.pendingUniversities
    },
    typeDistribution: {
      public: result.publicCount,
      private: result.privateCount,
      community: result.communityCount
    },
    enrollment: {
      total: result.totalEnrollment,
      average: Math.round(result.avgEnrollment || 0)
    },
    stateDistribution,
    recentlyAdded
  };
};

// Static method for advanced search
universitySchema.statics.searchUniversities = function(query, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    state,
    status = 'active',
    minEnrollment,
    maxEnrollment
  } = options;

  const searchQuery = { status };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Filter by type
  if (type) {
    searchQuery.type = type;
  }

  // Filter by state
  if (state) {
    searchQuery['location.state'] = state;
  }

  // Filter by enrollment range
  if (minEnrollment || maxEnrollment) {
    searchQuery['enrollment.total'] = {};
    if (minEnrollment) searchQuery['enrollment.total'].$gte = minEnrollment;
    if (maxEnrollment) searchQuery['enrollment.total'].$lte = maxEnrollment;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  return this.find(searchQuery)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Static method to find universities near a location
universitySchema.statics.findNearLocation = function(latitude, longitude, maxDistance = 100000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude] // [longitude, latitude]
        },
        $maxDistance: maxDistance // meters
      }
    },
    status: 'active'
  });
};

module.exports = mongoose.model('University', universitySchema);