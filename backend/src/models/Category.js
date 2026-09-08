const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    nameTa: {
      type: String,
      default: '',
    },
    nameHi: {
      type: String,
      default: '',
    },
    itemCount: {
      type: String,
      default: '0 Items',
    },
    image: {
      type: String,
      default: '',
    },
    tag: {
      type: String,
      default: 'Fresh & High Quality',
    },
    color: {
      type: String,
      default: 'from-blue-600 to-cyan-500',
    },
    // Audit fields
    bit_IsActive: {
      type: Boolean,
      default: true,
    },
    txt_Created_By: {
      type: String,
      default: 'system',
    },
    dte_Created_Date: {
      type: Date,
      default: Date.now,
    },
    txt_Modified_By: {
      type: String,
      default: 'system',
    },
    dte_Modified_Date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.categoryId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

module.exports = Category;
