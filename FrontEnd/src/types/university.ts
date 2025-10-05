export interface University {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    address?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  founded?: number; // Backend uses 'founded'
  established?: number; // For backward compatibility
  type: 'public' | 'private' | 'community';
  enrollment: {
    undergraduate: number;
    graduate: number;
    total: number;
  };
  website?: string;
  description?: string;
  accreditation?: {
    agencies?: string[];
    status: 'accredited' | 'candidate' | 'not_accredited' | 'unknown';
    lastReview?: Date;
  };
  rankings?: {
    national?: number;
    global?: number;
    subject?: Record<string, number>;
  };
  programs?: {
    undergraduate?: string[];
    graduate?: string[];
    doctoral?: string[];
    degrees?: string[];
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    fax?: string;
    admissions?: {
      phone?: string;
      email?: string;
    };
  };
  status?: 'active' | 'inactive' | 'pending' | 'closed';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUniversityData extends Record<string, unknown> {
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    address?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  founded?: number; // Backend uses 'founded'
  established?: number; // For backward compatibility
  type: 'public' | 'private' | 'community';
  status?: 'active' | 'inactive' | 'pending' | 'closed';
  enrollment: {
    undergraduate: number;
    graduate: number;
    total: number;
  };
  website?: string;
  description?: string;
  accreditation?: {
    agencies?: string[];
    status: 'accredited' | 'candidate' | 'not_accredited' | 'unknown';
    lastReview?: Date;
  };
  rankings?: {
    national?: number;
    global?: number;
    subject?: Record<string, number>;
  };
  programs?: {
    undergraduate?: string[];
    graduate?: string[];
    doctoral?: string[];
    degrees?: string[];
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    fax?: string;
    admissions?: {
      phone?: string;
      email?: string;
    };
  };
}

export interface UpdateUniversityData extends Partial<CreateUniversityData> {
  _id: string;
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
  type?: 'public' | 'private' | 'community';
  location?: string;
  minEnrollment?: number;
  maxEnrollment?: number;
  minEstablished?: number;
  maxEstablished?: number;
  programs?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}