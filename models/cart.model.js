import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
   productTitle: {
      type: String,
      required : true
    },

    image : {
      type: String,
      required : true
    },

    rating:{
      type:Number,
      required : true
    },

    price:{
      type:Number,
      required : true
    },
    oldPrice:{
      type:Number,
      // required : true
    },

    discount:{
      type:String,
      // required : true
    },
    size:{
      type:String
    },
    weight:{
      type:String
    },
    ram:{
      type:String
    },

    quantity:{
      type:Number,
      required : true,
      default: 1  // Default to 1 if not provided
    },

    subTotal :{
      type:Number,
      required : true,
      default: 0  // Default to 0 if not provided
    },

    productId:{
      type:String,
      required : true
    },

    countInStock : {
      type:Number,
      required : true
    },
    userId :{
      type: String,
      required : true
    },
    brand :{
      type: String,
      // required : true
    }
    


},
{
  timestamps: true
})

const CartProductModel = mongoose.model('Cart', cartProductSchema)

export default CartProductModel;