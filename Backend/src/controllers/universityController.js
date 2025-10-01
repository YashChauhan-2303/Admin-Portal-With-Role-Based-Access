const University = require('../models/University');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { successResponse } = require('../utils/response');
const { paginate, searchFilter } = require('../utils/helpers');

class UniversityController {
  // Get all universities with pagination and search
  async getAllUniversities(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', search } = req.query;
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { 'location.city': { $regex: search, $options: 'i' } },
            { 'location.state': { $regex: search, $options: 'i' } },
            { type: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const [universities, total] = await Promise.all([
        University.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('createdBy', 'name email')
          .populate('updatedBy', 'name email'),
        University.countDocuments(query)
      ]);

      const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      };

      logger.info(`Retrieved ${universities.length} universities for user: ${req.user.email}`);

      return successResponse(res, {
        universities,
        pagination
      });

    } catch (error) {
      next(error);
    }
  }

  // Get university by ID
  async getUniversityById(req, res, next) {
    try {
      const { id } = req.params;

      const university = await University.findById(id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!university) {
        throw new AppError('University not found', 404);
      }

      logger.info(`Retrieved university: ${university.name} by user: ${req.user.email}`);

      return successResponse(res, { university });

    } catch (error) {
      if (error.name === 'CastError') {
        return next(new AppError('Invalid university ID', 400));
      }
      next(error);
    }
  }

  // Create new university
  async createUniversity(req, res, next) {
    try {
      const universityData = req.body;

      // Check if university with same name already exists
      const existingUniversity = await University.findOne({
        name: { $regex: new RegExp(`^${universityData.name}$`, 'i') }
      });
      
      if (existingUniversity) {
        throw new AppError('University with this name already exists', 400);
      }

      const newUniversity = new University({
        ...universityData,
        createdBy: req.user.id
      });

      await newUniversity.save();

      // Populate the created university with user details
      await newUniversity.populate('createdBy', 'name email');

      logger.info(`University created: ${newUniversity.name} by user: ${req.user.email}`);

      return successResponse(res, { university: newUniversity }, 'University created successfully', 201);

    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return next(new AppError(`Validation error: ${validationErrors.join(', ')}`, 400));
      }
      next(error);
    }
  }

  // Update university
  async updateUniversity(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log('==== UPDATE UNIVERSITY DEBUG ====');
      console.log('ID:', id);
      console.log('Update Data:', JSON.stringify(updateData, null, 2));

      // Check if name is being updated and if it conflicts with existing university
      if (updateData.name) {
        const existingUniversity = await University.findOne({
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          _id: { $ne: id }
        });
        
        if (existingUniversity) {
          throw new AppError('University with this name already exists', 400);
        }
      }

      // Update university
      const updatedUniversity = await University.findByIdAndUpdate(
        id,
        {
          ...updateData,
          updatedBy: req.user.id
        },
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('createdBy', 'name email')
       .populate('updatedBy', 'name email');

      if (!updatedUniversity) {
        throw new AppError('University not found', 404);
      }

      logger.info(`University updated: ${updatedUniversity.name} by user: ${req.user.email}`);

      return successResponse(res, { university: updatedUniversity }, 'University updated successfully');

    } catch (error) {
      console.error('==== UPDATE UNIVERSITY ERROR ====');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if (error.errors) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      console.error('Full error:', error);
      
      if (error.name === 'CastError') {
        return next(new AppError('Invalid university ID', 400));
      }
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        console.error('Formatted validation errors:', validationErrors);
        return next(new AppError(`Validation error: ${validationErrors.join(', ')}`, 400));
      }
      next(error);
    }
  }

  // Delete university
  async deleteUniversity(req, res, next) {
    try {
      const { id } = req.params;

      const deletedUniversity = await University.findByIdAndDelete(id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!deletedUniversity) {
        throw new AppError('University not found', 404);
      }

      logger.info(`University deleted: ${deletedUniversity.name} by user: ${req.user.email}`);

      return successResponse(res, { university: deletedUniversity }, 'University deleted successfully');

    } catch (error) {
      if (error.name === 'CastError') {
        return next(new AppError('Invalid university ID', 400));
      }
      next(error);
    }
  }

  // Get university statistics
  async getUniversityStats(req, res, next) {
    try {
      const [
        totalUniversities,
        publicCount,
        privateCount,
        avgEnrollment,
        oldestUniversity,
        newestUniversity
      ] = await Promise.all([
        University.countDocuments(),
        University.countDocuments({ type: 'Public' }),
        University.countDocuments({ type: 'Private' }),
        University.aggregate([
          {
            $group: {
              _id: null,
              avgUndergrad: { $avg: '$enrollment.undergraduate' },
              avgGraduate: { $avg: '$enrollment.graduate' },
              avgTotal: { $avg: '$enrollment.total' }
            }
          }
        ]),
        University.findOne().sort({ established: 1 }),
        University.findOne().sort({ established: -1 })
      ]);

      const stats = {
        totalUniversities,
        publicUniversities: publicCount,
        privateUniversities: privateCount,
        averageEnrollment: avgEnrollment[0] || { avgUndergrad: 0, avgGraduate: 0, avgTotal: 0 },
        oldestUniversity: oldestUniversity ? {
          name: oldestUniversity.name,
          established: oldestUniversity.established
        } : null,
        newestUniversity: newestUniversity ? {
          name: newestUniversity.name,
          established: newestUniversity.established
        } : null
      };

      logger.info(`University statistics retrieved by user: ${req.user.email}`);

      return successResponse(res, { stats });

    } catch (error) {
      next(error);
    }
  }

  // Search universities by specific criteria
  async searchUniversities(req, res, next) {
    try {
      const { 
        name, 
        location, 
        type, 
        minEnrollment, 
        maxEnrollment, 
        minEstablished, 
        maxEstablished,
        programs,
        page = 1,
        limit = 10
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      let query = {};

      if (name) {
        query.name = { $regex: name, $options: 'i' };
      }

      if (location) {
        query.$or = [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.state': { $regex: location, $options: 'i' } },
          { 'location.country': { $regex: location, $options: 'i' } }
        ];
      }

      if (type) {
        query.type = { $regex: type, $options: 'i' };
      }

      if (minEnrollment || maxEnrollment) {
        query['enrollment.total'] = {};
        if (minEnrollment) query['enrollment.total'].$gte = parseInt(minEnrollment);
        if (maxEnrollment) query['enrollment.total'].$lte = parseInt(maxEnrollment);
      }

      if (minEstablished || maxEstablished) {
        query.established = {};
        if (minEstablished) query.established.$gte = parseInt(minEstablished);
        if (maxEstablished) query.established.$lte = parseInt(maxEstablished);
      }

      if (programs) {
        const programsArray = programs.split(',').map(p => p.trim());
        query['programs.degrees'] = { 
          $elemMatch: { 
            $in: programsArray.map(p => new RegExp(p, 'i'))
          }
        };
      }

      // Execute query with pagination
      const [universities, total] = await Promise.all([
        University.find(query)
          .skip(skip)
          .limit(limitNum)
          .populate('createdBy', 'name email')
          .populate('updatedBy', 'name email'),
        University.countDocuments(query)
      ]);

      const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      };

      logger.info(`Advanced search performed by user: ${req.user.email}, found ${universities.length} results`);

      return successResponse(res, {
        universities,
        pagination,
        filters: { name, location, type, minEnrollment, maxEnrollment, minEstablished, maxEstablished, programs }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UniversityController();