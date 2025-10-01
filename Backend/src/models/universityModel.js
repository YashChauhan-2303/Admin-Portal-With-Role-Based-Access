const { universities } = require('../data/mockData');
const { generateId } = require('../utils/helpers');
const { AppError, NotFoundError, ConflictError } = require('../utils/errors');

class UniversityModel {
  constructor() {
    this.universities = universities;
  }

  // Find all universities with filters
  findAll(filters = {}) {
    let filteredUniversities = [...this.universities];

    // Apply filters
    if (filters.type) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters.location) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.name) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.minStudentCount) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.studentCount >= parseInt(filters.minStudentCount)
      );
    }

    if (filters.maxStudentCount) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.studentCount <= parseInt(filters.maxStudentCount)
      );
    }

    if (filters.minEstablished) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.established >= parseInt(filters.minEstablished)
      );
    }

    if (filters.maxEstablished) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.established <= parseInt(filters.maxEstablished)
      );
    }

    if (filters.programs) {
      const programsArray = filters.programs.split(',').map(p => p.trim().toLowerCase());
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.programs && uni.programs.some(program => 
          programsArray.some(searchProgram => 
            program.toLowerCase().includes(searchProgram)
          )
        )
      );
    }

    if (filters.ranking) {
      filteredUniversities = filteredUniversities.filter(uni => 
        uni.ranking && uni.ranking <= parseInt(filters.ranking)
      );
    }

    return filteredUniversities;
  }

  // Find university by ID
  findById(id) {
    const university = this.universities.find(uni => uni.id === parseInt(id));
    if (!university) {
      throw new NotFoundError('University not found');
    }
    return university;
  }

  // Find university by name
  findByName(name) {
    return this.universities.find(uni => 
      uni.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Create new university
  create(universityData) {
    // Check if university with same name already exists
    if (this.findByName(universityData.name)) {
      throw new ConflictError('University with this name already exists');
    }

    const newUniversity = {
      id: generateId(this.universities.map(u => u.id)),
      ...universityData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.universities.push(newUniversity);
    return newUniversity;
  }

  // Update university
  update(id, updateData) {
    const universityIndex = this.universities.findIndex(uni => uni.id === parseInt(id));
    
    if (universityIndex === -1) {
      throw new NotFoundError('University not found');
    }

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== this.universities[universityIndex].name) {
      const existingUniversity = this.findByName(updateData.name);
      if (existingUniversity) {
        throw new ConflictError('University with this name already exists');
      }
    }

    this.universities[universityIndex] = {
      ...this.universities[universityIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return this.universities[universityIndex];
  }

  // Delete university
  delete(id) {
    const universityIndex = this.universities.findIndex(uni => uni.id === parseInt(id));
    
    if (universityIndex === -1) {
      throw new NotFoundError('University not found');
    }

    const deletedUniversity = this.universities.splice(universityIndex, 1)[0];
    return deletedUniversity;
  }

  // Search universities with advanced criteria
  search(criteria) {
    let results = [...this.universities];

    // Text search across multiple fields
    if (criteria.text) {
      const searchText = criteria.text.toLowerCase();
      results = results.filter(uni => 
        uni.name.toLowerCase().includes(searchText) ||
        uni.location.toLowerCase().includes(searchText) ||
        uni.description?.toLowerCase().includes(searchText) ||
        (uni.programs && uni.programs.some(program => 
          program.toLowerCase().includes(searchText)
        ))
      );
    }

    // Apply other filters
    return this.findAll(criteria);
  }

  // Get university statistics
  getStats() {
    const stats = {
      total: this.universities.length,
      byType: {
        public: this.universities.filter(uni => uni.type === 'Public').length,
        private: this.universities.filter(uni => uni.type === 'Private').length
      },
      studentCounts: {
        total: this.universities.reduce((sum, uni) => sum + uni.studentCount, 0),
        average: Math.round(this.universities.reduce((sum, uni) => sum + uni.studentCount, 0) / this.universities.length),
        min: Math.min(...this.universities.map(uni => uni.studentCount)),
        max: Math.max(...this.universities.map(uni => uni.studentCount))
      },
      establishments: {
        oldest: Math.min(...this.universities.map(uni => uni.established)),
        newest: Math.max(...this.universities.map(uni => uni.established))
      },
      locations: {
        countries: [...new Set(this.universities.map(uni => 
          uni.location.split(',').pop().trim()
        ))].length,
        cities: [...new Set(this.universities.map(uni => 
          uni.location.split(',')[0].trim()
        ))].length
      }
    };

    // Top programs
    const allPrograms = this.universities.flatMap(uni => uni.programs || []);
    const programCounts = allPrograms.reduce((acc, program) => {
      acc[program] = (acc[program] || 0) + 1;
      return acc;
    }, {});
    
    stats.topPrograms = Object.entries(programCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([program, count]) => ({ program, count }));

    return stats;
  }

  // Get universities by location
  findByLocation(location) {
    return this.universities.filter(uni => 
      uni.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Get universities by type
  findByType(type) {
    return this.universities.filter(uni => 
      uni.type.toLowerCase() === type.toLowerCase()
    );
  }

  // Get universities offering specific programs
  findByPrograms(programs) {
    const programsArray = Array.isArray(programs) ? programs : [programs];
    return this.universities.filter(uni => 
      uni.programs && programsArray.some(program => 
        uni.programs.some(uniProgram => 
          uniProgram.toLowerCase().includes(program.toLowerCase())
        )
      )
    );
  }

  // Get universities within student count range
  findByStudentCountRange(min, max) {
    return this.universities.filter(uni => 
      uni.studentCount >= min && uni.studentCount <= max
    );
  }

  // Get universities within establishment year range
  findByEstablishedRange(minYear, maxYear) {
    return this.universities.filter(uni => 
      uni.established >= minYear && uni.established <= maxYear
    );
  }

  // Get top ranked universities
  getTopRanked(limit = 10) {
    return this.universities
      .filter(uni => uni.ranking)
      .sort((a, b) => a.ranking - b.ranking)
      .slice(0, limit);
  }

  // Bulk operations
  bulkCreate(universitiesData) {
    const results = [];
    const errors = [];

    universitiesData.forEach((data, index) => {
      try {
        const university = this.create(data);
        results.push(university);
      } catch (error) {
        errors.push({ index, error: error.message, data });
      }
    });

    return { results, errors };
  }

  bulkUpdate(updates) {
    const results = [];
    const errors = [];

    updates.forEach((update, index) => {
      try {
        const university = this.update(update.id, update.data);
        results.push(university);
      } catch (error) {
        errors.push({ index, error: error.message, update });
      }
    });

    return { results, errors };
  }
}

module.exports = new UniversityModel();