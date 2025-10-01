// Mock data for development - replace with real database in production

// Sample users with hashed passwords
const users = [
  {
    id: 1,
    email: 'admin@university.com',
    password: '$2a$12$Znml5oyQ/0Vbg4tPRIg.AuwQl08Kk4.xtbYdDtPNEZYU.w7GFPDCm', // password: admin123
    name: 'System Administrator',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    email: 'manager@university.com',
    password: '$2a$12$o1LEXuQ75hKh3h7aMCeXeO28A7Rk3Ei0lLb2iBi/ZWVY2Oxg2eZkW', // password: manager123
    name: 'University Manager',
    role: 'manager',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    email: 'viewer@university.com',
    password: '$2a$12$L/FigSGYdazk5aPxuxnJje1IlD81F59nw8StV.h4wYI5/.6K9FR8y', // password: viewer123
    name: 'Data Viewer',
    role: 'viewer',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

// Sample universities
const universities = [
  {
    id: 1,
    name: 'Harvard University',
    location: 'Cambridge, Massachusetts, USA',
    established: 1636,
    type: 'Private',
    studentCount: 23000,
    website: 'https://www.harvard.edu',
    description: 'Harvard University is a private Ivy League research university in Cambridge, Massachusetts.',
    programs: ['Medicine', 'Law', 'Business', 'Engineering', 'Arts & Sciences'],
    ranking: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Stanford University',
    location: 'Stanford, California, USA',
    established: 1885,
    type: 'Private',
    studentCount: 17000,
    website: 'https://www.stanford.edu',
    description: 'Stanford University is a private research university in Stanford, California.',
    programs: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Education'],
    ranking: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Massachusetts Institute of Technology',
    location: 'Cambridge, Massachusetts, USA',
    established: 1861,
    type: 'Private',
    studentCount: 11500,
    website: 'https://www.mit.edu',
    description: 'MIT is a private research university in Cambridge, Massachusetts.',
    programs: ['Engineering', 'Computer Science', 'Physics', 'Mathematics', 'Economics'],
    ranking: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'University of Oxford',
    location: 'Oxford, England, UK',
    established: 1096,
    type: 'Public',
    studentCount: 24000,
    website: 'https://www.ox.ac.uk',
    description: 'The University of Oxford is a collegiate research university in Oxford, England.',
    programs: ['Philosophy', 'Politics', 'Economics', 'Medicine', 'Literature'],
    ranking: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'University of Cambridge',
    location: 'Cambridge, England, UK',
    established: 1209,
    type: 'Public',
    studentCount: 23000,
    website: 'https://www.cam.ac.uk',
    description: 'The University of Cambridge is a collegiate research university in Cambridge, England.',
    programs: ['Mathematics', 'Physics', 'Engineering', 'Medicine', 'Natural Sciences'],
    ranking: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// User roles and their permissions
const roles = {
  admin: {
    name: 'Administrator',
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'universities:read',
      'universities:create',
      'universities:update',
      'universities:delete'
    ]
  },
  manager: {
    name: 'Manager',
    permissions: [
      'users:read',
      'universities:read',
      'universities:create',
      'universities:update'
    ]
  },
  viewer: {
    name: 'Viewer',
    permissions: [
      'universities:read'
    ]
  }
};

module.exports = {
  users,
  universities,
  roles
};