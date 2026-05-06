import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member', required: true },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const { _id, name, email, role, createdAt } = this;
  return { id: _id, name, email, role, createdAt };
};

export default mongoose.model('User', userSchema);
