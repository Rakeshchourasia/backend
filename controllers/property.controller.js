import Property from '../models/Property.js';
import fs from 'fs';

/**
 * @desc    Create a new property listing
 * @route   POST /api/properties
 * @access  Private (Seller or Admin)
 */
export const createProperty = async (req, res, next) => {
  try {
    // --- THIS IS THE KEY CHANGE ---
    // We now read all the new fields from the request body
    const {
      title,
      description,
      price,
      location,
      area,
      facing,
      openSides,
      plotNumber,
      ownerName,
      ownerRelation,
      ownerPhone,
      propertyType,
    } = req.body;

    const images = req.files.images ? req.files.images.map(file => file.path) : [];
    const documents = req.files.documents ? req.files.documents.map(file => file.path) : [];

    if (images.length === 0) {
      res.status(400);
      throw new Error('At least one image is required.');
    }

    const property = new Property({
      // Pass all the new fields to the model
      title,
      description,
      price,
      location,
      area,
      facing,
      openSides,
      plotNumber,
      ownerName,
      ownerRelation,
      ownerPhone,
      propertyType,
      images,
      documents,
      status: 'pending',
      seller: req.user._id,
      sellerContact: {
        name: req.user.name,
        email: req.user.email,
      },
    });

    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    // This will now correctly report any validation errors from Mongoose
    next(error);
  }
};


// --- ALL OTHER FUNCTIONS (getProperties, getPropertyById, etc.) REMAIN THE SAME ---
// You can keep your existing code for the functions below.

/**
 * @desc    Get all APPROVED properties with filtering, sorting, and pagination
 * @route   GET /api/properties
 * @access  Public
 */
export const getProperties = async (req, res, next) => {
  try {
    const filters = { status: 'approved' }; 

    if (req.query.location) {
      filters.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.minPrice) {
      filters.price = { ...filters.price, $gte: Number(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      filters.price = { ...filters.price, $lte: Number(req.query.maxPrice) };
    }
    
    const sort = req.query.sortBy ? { [req.query.sortBy.split(':')[0]]: req.query.sortBy.split(':')[1] === 'desc' ? -1 : 1 } : { createdAt: -1 };
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const properties = await Property.find(filters)
      .select('-documents')
      .populate('seller', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalProperties = await Property.countDocuments(filters);

    res.json({
      properties,
      currentPage: page,
      totalPages: Math.ceil(totalProperties / limit),
      totalProperties,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single property's full details
 * @route   GET /api/properties/:id
 * @access  Private (Premium Buyers)
 */
export const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', 'name email');
    
    if (property && property.status === 'approved') {
      res.json(property);
    } else {
      res.status(404);
      throw new Error('Property not found or is not available');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all properties listed by the currently logged-in seller
 * @route   GET /api/properties/my-listings
 * @access  Private (Seller or Admin)
 */
export const getMyListings = async (req, res, next) => {
  try {
    const properties = await Property.find({ seller: req.user._id });
    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a property listing (only before admin approval)
 * @route   PUT /api/properties/:id
 * @access  Private (Seller or Admin)
 */
export const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('You are not authorized to update this property');
    }

    if (property.status !== 'pending') {
      res.status(400);
      throw new Error('Cannot edit a property that has already been reviewed.');
    }

    // Update all fields from the request body
    Object.assign(property, req.body);
    
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a property listing
 * @route   DELETE /api/properties/:id
 * @access  Private (Seller or Admin)
 */
export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404);
      throw new Error('Property not found');
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('You are not authorized to delete this property');
    }
    
    // Clean up uploaded files before deleting the record
    property.images.forEach(filePath => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    property.documents.forEach(filePath => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await property.deleteOne();
    res.json({ message: 'Property removed successfully' });
  } catch (error) {
    next(error);
  }
};