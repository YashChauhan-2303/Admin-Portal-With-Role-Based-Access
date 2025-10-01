import { University, CreateUniversityData, UpdateUniversityData, UniversitiesResponse } from '@/types/university';
import { apiClient } from './api';

// Real API functions that connect to the backend
export const mockApi = {
  async getUniversities(): Promise<University[]> {
    const response = await apiClient.get<UniversitiesResponse>('/universities');
    
    if (response.success && response.data) {
      return response.data.universities.map(university => ({
        ...university,
        id: university._id // Add id for backward compatibility
      }));
    }
    
    throw new Error(response.message || 'Failed to fetch universities');
  },

  async createUniversity(data: CreateUniversityData): Promise<University> {
    const response = await apiClient.post<{ university: University }>('/universities', data);
    
    if (response.success && response.data) {
      return {
        ...response.data.university,
        id: response.data.university._id // Add id for backward compatibility
      };
    }
    
    throw new Error(response.message || 'Failed to create university');
  },

  async updateUniversity(data: UpdateUniversityData): Promise<University> {
    const { _id, ...updateData } = data;
    console.log('Updating university:', _id);
    console.log('Update data being sent:', JSON.stringify(updateData, null, 2));
    const response = await apiClient.put<{ university: University }>(`/universities/${_id}`, updateData);
    
    console.log('Update response:', response);
    
    if (response.success && response.data) {
      return {
        ...response.data.university,
        id: response.data.university._id // Add id for backward compatibility
      };
    }
    
    throw new Error(response.message || 'Failed to update university');
  },

  async deleteUniversity(id: string): Promise<void> {
    const response = await apiClient.delete(`/universities/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete university');
    }
  },

  // Note: toggleUniversityStatus has been removed as the backend doesn't support status field
};