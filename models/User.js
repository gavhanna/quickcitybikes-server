const crypto = require('crypto');
const mongoose = require('mongoose');
// const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    // slug: String,
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    familyName: {
      type: String,
    },
    givenName: {
      type: String,
    },
    name: {
      type: String,
    },
    googleId: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user',
    },
    // password: {
    //   type: String,
    //   required: [true, 'Please add a password'],
    //   minlength: 6,
    //   select: false,
    // },
    favourites: {
      dublin: Array,
      rouen: Array,
      toulouse: Array,
      luxembourg: Array,
      valence: Array,
      stockholm: Array,
      santander: Array,
      lund: Array,
      bruxelles: Array,
      lyon: Array,
      amiens: Array,
      lillestrom: Array,
      mulhouse: Array,
      ljubljana: Array,
      seville: Array,
      nancy: Array,
      namur: Array,
      creteil: Array,
      'clergy-pontoise': Array,
      vilnius: Array,
      toyama: Array,
      marseille: Array,
      nantes: Array,
      brisbane: Array,
      bescancon: Array,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index the following fields for searching
// https://stackoverflow.com/a/28775709
UserSchema.index({
  username: 'text',
  // slug: 'text',
  email: 'text',
});

// Create user slug from the name
// UserSchema.pre('save', function (next) {
//   this.slug = slugify(this.username, { lower: true });
//   next();
// });

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log('reset token:', this.resetPasswordToken);

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Reverse populate with virtuals
UserSchema.virtual('settings', {
  ref: 'Settings',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

module.exports = mongoose.model('User', UserSchema);
