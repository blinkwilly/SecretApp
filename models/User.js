const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

// Define the User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Password will be hashed with bcrypt
    sensitiveData: { type: String }, // This field will be encrypted
});

// Encryption key for mongoose-encryption (use environment variables for production)
const secretKey = "yourEncryptionKey123";
userSchema.plugin(encrypt, {
    secret: secretKey,
    encryptedFields: ['sensitiveData'], // Only encrypt this field
});

// Export the User model
module.exports = mongoose.model('User', userSchema);
