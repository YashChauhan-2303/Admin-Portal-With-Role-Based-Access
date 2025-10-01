export interface University {
  id: number;
  name: string;
  location: string;
  established: number;
  type: 'Public' | 'Private';
  studentCount: number;
  website?: string;
  description?: string;
  programs?: string[];
  ranking?: number;
  status?: 'Active' | 'Inactive'; // Optional since backend may not have this field
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateUniversityData extends Record<string, unknown> {
  name: string;
  location: string;
  established: number;
  type: 'Public' | 'Private';
  studentCount: number;
  website?: string;
  description?: string;
  programs?: string[];
  ranking?: number;
}

export interface UpdateUniversityData extends Partial<CreateUniversityData> {
  id: number;
}

// API Response types for universities
export interface UniversitiesResponse {
  universities: University[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UniversityResponse {
  university: University;
}

export interface UniversityStats {
  totalUniversities: number;
  publicUniversities: number;
  privateUniversities: number;
  averageStudentCount: number;
  oldestUniversity: number;
  newestUniversity: number;
  countriesRepresented: number;
}

// Search and filter types
export interface UniversityFilters {
  search?: string;
  type?: 'Public' | 'Private';
  location?: string;
  minStudentCount?: number;
  maxStudentCount?: number;
  minEstablished?: number;
  maxEstablished?: number;
  programs?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}