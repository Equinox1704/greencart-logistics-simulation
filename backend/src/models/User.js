import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
{
email: { type: String, unique: true, required: true, lowercase: true, trim: true },
passwordHash: { type: String, required: true },
role: { type: String, enum: ['manager', 'viewer'], default: 'manager' }
},
{ timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;