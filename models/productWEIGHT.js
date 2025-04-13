import mongoose from "mongoose";
const productWEIGHTSchema = new mongoose.Schema({
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

  const ProductWEIGHTModel = mongoose.model("ProductWEIGHT", productWEIGHTSchema);
  
  export default ProductWEIGHTModel;