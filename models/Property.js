import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  // --- Existing Fields ---
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true }, // Will hold the address
  area: { type: Number, required: true },
  
  // --- NEW FIELDS ---
  facing: {
    type: String,
    enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'],
    required: true,
  },
  openSides: { type: Number, required: true },
  plotNumber: { type: String },
  ownerName: { type: String, required: true },
  ownerRelation: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  propertyType: {
    type: String,
    enum: ['Agricultural', 'Residential', 'Commercial'],
    required: true,
  },
  
  // --- File and Status Fields ---
  images: [{ type: String, required: true }],
  documents: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  
  // --- Seller Info (from logged-in user) ---
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  sellerContact: {
      name: { type: String, required: true },
      email: { type: String, required: true },
  }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);
export default Property;