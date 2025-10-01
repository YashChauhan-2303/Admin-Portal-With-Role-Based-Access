const helmet = require('helmet');
const config = require('../config');

// Enhanced security configuration
const securityConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false,
  
  // Cross Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  },
  
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },
  
  // Frame Guard
  frameguard: {
    action: 'deny'
  },
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: {
    policy: ["no-referrer"]
  },
  
  // X-XSS-Protection
  xssFilter: true
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Request from origin:', origin);
    console.log('Allowed origins:', config.security.corsOrigins);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow localhost on any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('CORS: Allowing localhost origin');
      return callback(null, true);
    }
    
    // Allow configured origins
    if (config.security.corsOrigins.includes(origin)) {
      console.log('CORS: Allowing configured origin:', origin);
      return callback(null, true);
    }
    
    // Log rejected origin for debugging
    console.log('CORS REJECTED origin:', origin);
    console.log('Expected one of:', config.security.corsOrigins);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

module.exports = {
  securityConfig,
  corsOptions
};