import mongoose from "mongoose";
const productRAMSSchema = new mongoose.Schema({
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

  const ProductRAMSModel = mongoose.model("ProductRAMS", productRAMSSchema);
  
  export default ProductRAMSModel;