import { University, CreateUniversityData, UpdateUniversityData } from '@/types/university';

// Mock data
let universities: University[] = [
  {
    id: '1',
    name: 'Stanford University',
    location: 'Stanford, CA',
    type: 'Private',
    contact: 'admissions@stanford.edu',
    status: 'Active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'University of California, Berkeley',
    location: 'Berkeley, CA',
    type: 'Public',
    contact: 'admissions@berkeley.edu',
    status: 'Active',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Harvard University',
    location: 'Cambridge, MA',
    type: 'Private',
    contact: 'admissions@harvard.edu',
    status: 'Active',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    name: 'Community College of Denver',
    location: 'Denver, CO',
    type: 'Community',
    contact: 'info@ccd.edu',
    status: 'Inactive',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '5',
    name: 'MIT',
    location: 'Cambridge, MA',
    type: 'Private',
    contact: 'admissions@mit.edu',
    status: 'Active',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  async getUniversities(): Promise<University[]> {
    await delay(300);
    return [...universities];
  },

  async createUniversity(data: CreateUniversityData): Promise<University> {
    await delay(500);
    
    const newUniversity: University = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    universities.push(newUniversity);
    return newUniversity;
  },

  async updateUniversity(data: UpdateUniversityData): Promise<University> {
    await delay(500);
    
    const index = universities.findIndex(u => u.id === data.id);
    if (index === -1) {
      throw new Error('University not found');
    }
    
    const updatedUniversity = {
      ...universities[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    universities[index] = updatedUniversity;
    return updatedUniversity;
  },

  async deleteUniversity(id: string): Promise<void> {
    await delay(300);
    
    const index = universities.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('University not found');
    }
    
    universities.splice(index, 1);
  },

  async toggleUniversityStatus(id: string): Promise<University> {
    await delay(300);
    
    const university = universities.find(u => u.id === id);
    if (!university) {
      throw new Error('University not found');
    }
    
    university.status = university.status === 'Active' ? 'Inactive' : 'Active';
    university.updatedAt = new Date().toISOString();
    
    return university;
  },
};