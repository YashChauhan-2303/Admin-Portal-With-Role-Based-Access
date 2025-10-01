const { universities } = require('../data/mockData');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { successResponse } = require('../utils/response');
const { paginate, searchFilter } = require('../utils/helpers');

class UniversityController {
  // Get all universities with pagination and search
  async getAllUniversities(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder = 'asc', search } = req.query;

      let filteredUniversities = [...universities];

      // Apply search filter
      if (search) {
        filteredUniversities = searchFilter(universities, search, [
          'name', 'location', 'type', 'description'
        ]);
      }

      // Apply sorting
      if (sortBy) {
        filteredUniversities.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];
          
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (sortOrder === 'desc') {
            return aValue < bValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Apply pagination
      const paginationResult = paginate(filteredUniversities, page, limit);

      logger.info(`Retrieved ${paginationResult.data.length} universities for user: ${req.user.email}`);

      return successResponse(res, {
        universities: paginationResult.data,
        pagination: paginationResult.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  // Get university by ID
  async getUniversityById(req, res, next) {
    try {
      const { id } = req.params;
      const universityId = parseInt(id);

      const university = universities.find(uni => uni.id === universityId);

      if (!university) {
        throw new AppError('University not found', 404);
      }

      logger.info(`Retrieved university: ${university.name} by user: ${req.user.email}`);

      return successResponse(res, { university });

    } catch (error) {
      next(error);
    }
  }

  // Create new university
  async createUniversity(req, res, next) {
    try {
      const universityData = req.body;

      // Check if university with same name already exists
      const existingUniversity = universities.find(
        uni => uni.name.toLowerCase() === universityData.name.toLowerCase()
      );
      
      if (existingUniversity) {
        throw new AppError('University with this name already exists', 400);
      }

      const newUniversity = {
        id: universities.length > 0 ? Math.max(...universities.map(u => u.id)) + 1 : 1,
        ...universityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user.id
      };

      universities.push(newUniversity);

      logger.info(`University created: ${newUniversity.name} by user: ${req.user.email}`);

      return successResponse(res, { university: newUniversity }, 'University created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  // Update university
  async updateUniversity(req, res, next) {
    try {
      const { id } = req.params;
      const universityId = parseInt(id);
      const updateData = req.body;

      const universityIndex = universities.findIndex(uni => uni.id === universityId);

      if (universityIndex === -1) {
        throw new AppError('University not found', 404);
      }

      // Check if name is being updated and if it conflicts with existing university
      if (updateData.name) {
        const existingUniversity = universities.find(
          uni => uni.name.toLowerCase() === updateData.name.toLowerCase() && uni.id !== universityId
        );
        
        if (existingUniversity) {
          throw new AppError('University with this name already exists', 400);
        }
      }

      // Update university
      universities[universityIndex] = {
        ...universities[universityIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
      };

      logger.info(`University updated: ${universities[universityIndex].name} by user: ${req.user.email}`);

      return successResponse(res, { university: universities[universityIndex] }, 'University updated successfully');

    } catch (error) {
      next(error);
    }
  }

  // Delete university
  async deleteUniversity(req, res, next) {
    try {
      const { id } = req.params;
      const universityId = parseInt(id);

      const universityIndex = universities.findIndex(uni => uni.id === universityId);

      if (universityIndex === -1) {
        throw new AppError('University not found', 404);
      }

      const deletedUniversity = universities.splice(universityIndex, 1)[0];

      logger.info(`University deleted: ${deletedUniversity.name} by user: ${req.user.email}`);

      return successResponse(res, { university: deletedUniversity }, 'University deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  // Get university statistics
  async getUniversityStats(req, res, next) {
    try {
      const stats = {
        totalUniversities: universities.length,
        publicUniversities: universities.filter(uni => uni.type === 'Public').length,
        privateUniversities: universities.filter(uni => uni.type === 'Private').length,
        averageStudentCount: Math.round(universities.reduce((sum, uni) => sum + uni.studentCount, 0) / universities.length),
        oldestUniversity: Math.min(...universities.map(uni => uni.established)),
        newestUniversity: Math.max(...universities.map(uni => uni.established)),
        countriesRepresented: [...new Set(universities.map(uni => uni.location.split(',').pop().trim()))].length
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
        minStudentCount, 
        maxStudentCount, 
        minEstablished, 
        maxEstablished,
        programs,
        page = 1,
        limit = 10
      } = req.query;

      let filteredUniversities = [...universities];

      // Apply filters
      if (name) {
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (location) {
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      if (type) {
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.type.toLowerCase() === type.toLowerCase()
        );
      }

      if (minStudentCount) {
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.studentCount >= parseInt(minStudentCount)
        );
      }

      if (maxStudentCount) {
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.studentCount <= parseInt(maxStudentCount)
        );
      }

      if (minEstablished) {
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.established >= parseInt(minEstablished)
        );
      }

      if (maxEstablished) {
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.established <= parseInt(maxEstablished)
        );
      }

      if (programs) {
        const programsArray = programs.split(',').map(p => p.trim().toLowerCase());
        filteredUniversities = filteredUniversities.filter(uni => 
          uni.programs && uni.programs.some(program => 
            programsArray.some(searchProgram => 
              program.toLowerCase().includes(searchProgram)
            )
          )
        );
      }

      // Apply pagination
      const paginationResult = paginate(filteredUniversities, page, limit);

      logger.info(`Advanced search performed by user: ${req.user.email}, found ${paginationResult.data.length} results`);

      return successResponse(res, {
        universities: paginationResult.data,
        pagination: paginationResult.pagination,
        filters: { name, location, type, minStudentCount, maxStudentCount, minEstablished, maxEstablished, programs }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UniversityController();