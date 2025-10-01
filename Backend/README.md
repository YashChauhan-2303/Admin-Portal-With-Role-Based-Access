# University Management Backend API

A RESTful API for managing universities with role-based access control (RBAC) built with Node.js and Express.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Viewer)
  - Secure password hashing with bcrypt

- **University Management**
  - CRUD operations for universities
  - Search and pagination
  - Data validation

- **User Management**
  - User creation and management (Admin only)
  - Profile management
  - Password updates

- **Security**
  - Helmet.js for security headers
  - Rate limiting
  - CORS configuration
  - Input validation with Joi

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration

### Running the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Universities
- `GET /api/universities` - Get all universities (with pagination and search)
- `GET /api/universities/:id` - Get university by ID
- `POST /api/universities` - Create new university (Admin/Manager)
- `PUT /api/universities/:id` - Update university (Admin/Manager)
- `DELETE /api/universities/:id` - Delete university (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `PUT /api/users/:id/password` - Update user password (Admin or own profile)
- `DELETE /api/users/:id` - Delete user (Admin only)

## User Roles

### Admin
- Full access to all resources
- Can manage users and universities
- Can delete universities

### Manager
- Can view and manage universities
- Can create and update universities
- Cannot delete universities or manage users

### Viewer
- Read-only access to universities
- Cannot modify any data

## Default Users

The system comes with default users for testing:

- **Admin**: admin@university.com / admin123
- **Manager**: manager@university.com / manager123
- **Viewer**: viewer@university.com / viewer123

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| JWT_SECRET | JWT secret key | (change in production) |
| JWT_EXPIRES_IN | JWT expiration time | 24h |

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```.

### Pagination Response
```json
{
  "success": true,
  "data": {
    "universities": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Development

### Project Structure
```
src/
├── data/           # Mock data (replace with database models)
├── middleware/     # Express middleware
├── routes/         # API routes
├── validation/     # Input validation schemas
└── server.js       # Main server file
```

### Adding New Features

1. Create validation schemas in `src/validation/schemas.js`
2. Add routes in appropriate files in `src/routes/`
3. Update middleware if needed
4. Add tests

## Security Considerations

- Change JWT_SECRET in production
- Use HTTPS in production
- Implement proper database with connection pooling
- Add request logging
- Consider implementing refresh tokens
- Add more comprehensive rate limiting
- Implement email verification for user registration

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Email notifications
- File upload support
- Advanced search and filtering
- Audit logging
- API documentation with Swagger
- Docker containerization
- Unit and integration tests