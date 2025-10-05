# 🎓 University Management System with Role-Based Access Control

A full-stack web application for managing university data with secure role-based access control (RBAC). Built with React, Node.js, Express, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.3.1-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control (RBAC)** with two roles:
  - **Admin**: Full CRUD access to all resources including user management
  - **Viewer**: Read-only access to university data
- **Password encryption** using bcrypt with salt rounds
- **Rate limiting** on authentication endpoints to prevent brute force attacks
- **Session management** with automatic token refresh

### 🏫 University Management
- **Complete CRUD operations** for university data
- **Detailed university profiles** including:
  - Basic information (name, type, location)
  - Contact details and official website
  - Enrollment statistics and rankings
  - Academic programs and facilities
  - Accreditation status
  - Demographics and diversity metrics
- **Advanced search and filtering** capabilities
- **Pagination** for large datasets
- **Real-time data validation**

### 🎨 User Interface
- **Modern, responsive design** built with React and Tailwind CSS
- **Animated 3D backgrounds** using Vanta.js on authentication pages
- **Intuitive dashboard** with role-specific views
- **Modal-based forms** for create/edit operations
- **Confirmation dialogs** for destructive actions
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Password visibility toggle** for better UX

### 🛡️ Security Features
- **Helmet.js** for secure HTTP headers
- **CORS** configuration for cross-origin requests
- **XSS protection** with input sanitization
- **SQL injection prevention** through parameterized queries
- **Rate limiting** on sensitive endpoints
- **Request logging** for audit trails
- **Error handling** without exposing sensitive information

### 📊 Monitoring & Logging
- **Winston logger** for structured logging
- **Request/response logging** middleware
- **Health check endpoints** for monitoring
- **Database connection health monitoring**
- **Automatic log rotation**

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Reusable component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Vanta.js + Three.js** - 3D animated backgrounds

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Winston** - Logging library
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting
- **Joi** - Schema validation
- **Node-cron** - Scheduled tasks

## 📁 Project Structure

```
uni-manage-rbac/
├── Backend/
│   ├── src/
│   │   ├── config/          # Configuration files (DB, logger)
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Custom middleware (auth, validation, security)
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API route definitions
│   │   ├── seeds/           # Database seeding scripts
│   │   ├── utils/           # Utility functions
│   │   ├── validation/      # Input validation schemas
│   │   └── server.js        # Entry point
│   ├── logs/                # Application logs
│   └── package.json
│
├── FrontEnd/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # Shadcn/ui components
│   │   │   └── ...         # Custom components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and API client
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json
│
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** or **bun**
- **MongoDB Atlas account** (or local MongoDB instance)
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YashChauhan-2303/Admin-Portal-With-Role-Based-Access.git
cd uni-manage-rbac
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../FrontEnd
npm install
# or if using bun
bun install
```

## 🌍 Environment Variables

### Backend (.env)

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/uni-manage-rbac?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=30
```

### Frontend (.env)

Create a `.env` file in the `FrontEnd` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

> **⚠️ Important**: Never commit `.env` files to version control. Add them to `.gitignore`.

## 🏃 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd Backend
npm run dev
# or
nodemon start
```

The backend server will start on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd FrontEnd
npm run dev
# or if using bun
bun run dev
```

The frontend will start on `http://localhost:5173`

### Production Mode

#### Build Frontend

```bash
cd FrontEnd
npm run build
```

#### Start Backend

```bash
cd Backend
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "viewer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "viewer"
  }
}
```

### University Endpoints

#### Get All Universities
```http
GET /api/universities
Authorization: Bearer <token>
```

#### Get University by ID
```http
GET /api/universities/:id
Authorization: Bearer <token>
```

#### Create University (Admin only)
```http
POST /api/universities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Stanford University",
  "type": "Private",
  "location": {
    "city": "Stanford",
    "state": "California",
    "country": "USA"
  },
  "establishedYear": 1885,
  "website": "https://www.stanford.edu"
}
```

#### Update University (Admin only)
```http
PUT /api/universities/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete University (Admin only)
```http
DELETE /api/universities/:id
Authorization: Bearer <token>
```

### User Management Endpoints

#### Get All Users (Admin only)
```http
GET /api/users
Authorization: Bearer <token>
```

#### Update User Role (Admin only)
```http
PUT /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "editor"
}
```

## 🔒 Security Features

### Rate Limiting
- **Authentication endpoints**: 30 requests per 5 minutes
- **General API endpoints**: 100 requests per 15 minutes

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Token
- Tokens expire after 7 days (configurable)
- Stored in localStorage (frontend)
- Validated on every protected route

### CORS Configuration
- Configured to accept requests from specified origins only
- Credentials support enabled

## 🧪 Testing

### Manual Testing

1. **Create an account** through the signup page
2. **Login** with your credentials
3. **Test role-based access**:
   - Viewer: Can only view universities
   - Admin: Full CRUD access on universities + user management

### API Testing with Postman/Thunder Client

Import the following environment variables:
- `baseUrl`: `http://localhost:5000/api`
- `token`: Your JWT token after login

## 🎯 Role-Based Permissions

| Feature | Viewer | Admin |
|---------|--------|-------|
| View Universities | ✅ | ✅ |
| Create University | ❌ | ✅ |
| Edit University | ❌ | ✅ |
| Delete University | ❌ | ✅ |
| View Users | ❌ | ✅ |
| Update User Roles | ❌ | ✅ |
| Delete Users | ❌ | ✅ |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Yash Chauhan**
- GitHub: [@YashChauhan-2303](https://github.com/YashChauhan-2303)

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Vanta.js](https://www.vantajs.com/) for the animated backgrounds
- [MongoDB](https://www.mongodb.com/) for the database solution
- All contributors and open-source libraries used in this project

## 📧 Support

For support, email yashchauhan2303@example.com or open an issue in the repository.

---

Made with ❤️ by Yash Chauhan
