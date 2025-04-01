import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    label: { type: String, required: true }, // e.g., "Home", "Office"
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);


const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    addresses: [addressSchema],
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Optionally add other customer-specific fields
    // Vendor data
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor"
    }
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.plugin(mongoosePaginate);

export default mongoose.model('User', userSchema);
