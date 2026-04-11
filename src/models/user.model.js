const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'staff'], default: 'staff' },
  active:   { type: Boolean, default: true },
}, { timestamps: true });

// hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// vérifier le mot de passe
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// ne jamais retourner le mot de passe
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);