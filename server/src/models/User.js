import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'manager', 'admin'],
      default: 'student',
    },
    phone: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'Karachi',
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: 'Enthusiastic community impact contributor.',
    },
    avatar: {
      type: String,
      default: '',
    },
    points: {
      type: Number,
      default: 0,
    },
    hoursContributed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    badges: {
      type: [String],
      default: ['Impact Pioneer'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, name: this.name, email: this.email },
    process.env.JWT_SECRET || 'impacthub_secret_key',
    { expiresIn: '30d' }
  );
};

const User = mongoose.model('User', userSchema);
export default User;
