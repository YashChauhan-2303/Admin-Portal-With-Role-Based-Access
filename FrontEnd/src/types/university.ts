export interface University {
  id: string;
  name: string;
  location: string;
  type: 'Public' | 'Private' | 'Community';
  contact: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniversityData {
  name: string;
  location: string;
  type: 'Public' | 'Private' | 'Community';
  contact: string;
  status: 'Active' | 'Inactive';
}

export interface UpdateUniversityData extends Partial<CreateUniversityData> {
  id: string;
}