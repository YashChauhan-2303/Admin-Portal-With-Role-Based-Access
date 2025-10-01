const crypto = require('crypto');
const config = require('../config');

// Encrypt data
const encrypt = (text) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(config.jwt.secret, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// Decrypt data
const decrypt = (encryptedData) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(config.jwt.secret, 'salt', 32);
  
  const decipher = crypto.createDecipher(
    algorithm, 
    key, 
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Hash data (one-way)
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate HMAC signature
const generateHMAC = (data, secret = config.jwt.secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

// Verify HMAC signature
const verifyHMAC = (data, signature, secret = config.jwt.secret) => {
  const expectedSignature = generateHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// Generate UUID v4
const generateUUID = () => {
  return crypto.randomUUID();
};

// Constant time string comparison
const constantTimeCompare = (a, b) => {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateSecureToken,
  generateHMAC,
  verifyHMAC,
  generateUUID,
  constantTimeCompare
};