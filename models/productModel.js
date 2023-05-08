const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        
        userId: {
            type: ObjectId,
            ref: "user",
            trim: true,
            required: true,
          },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            trim: true,
        },

        currencyId: {
            type: String,
            required: true,
            trim: true,
        },

        isFreeShipping: {
            type: Boolean,
            default: false,
            trim: true,
        },

        availableSizes: {
            type: [String],
            required: true,
            trim: true,
            enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
        },

        deletedAt: { type: Date, default: null },

        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);