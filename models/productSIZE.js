import mongoose from "mongoose";
const productSIZESchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  }
},
  { timestamp: true });

  const ProductSIZEModel = mongoose.model("ProductSIZE", productSIZESchema);
  
  export default ProductSIZEModel;