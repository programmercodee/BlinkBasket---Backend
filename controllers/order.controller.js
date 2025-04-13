// import { request, response } from "express";
import { parse } from "dotenv";
import ProductModel from '../models/product.model.js';
import OrderModel from "../models/order.model.js";

// export const createOrderController = async (request, response) => {
//   try {
//     let order = new OrderModel({
//       userId: request.body.userId,
//       products: request.body.products,
//       paymentId: request.body.paymentId,
//       payment_status: request.body.payment_status,
//       delivery_address: request.body.delivery_address,
//       totalAmt: request.body.totalAmt,
//       date: request.body.date
//     });

//     console.log(products)

//     if (!order) {
//       response.status(500).json({
//         error: true,
//         success: false
//       })
//     }

//     for (let i = 0; i < request.body.products.length; i++) {

//       await ProductModel.findByIdAndUpdate(
//         request.body.products[i].productId,
//         {
//           countInStock: parseInt(request.body.productId[i].countInStock - request.body.products[i].quantity),

//         },
//         { new: true }
//       )
//     }

//     order = await order.save();

//     return response.status(200).json({
//       error: false,
//       success: true,
//       message: "Thank You, Your is order placed",
//       order: order
//     });



//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     })
//   }
// }




export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId //order id

    const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).
      populate('delivery_address userId')

    return response.status(200).json({



      message: "order list",



      data: orderlist,
      error: false,
      success: true
    })




  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}




export const createOrderController = async (request, response) => {
  try {
    // Ensure the request body contains products
    if (!request.body.products || !Array.isArray(request.body.products)) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Invalid products data",
      });
    }


    // Fix: Corrected typo in `OrderModel`
    let order = new OrderModel({
      userId: request.body.userId,
      products: request.body.products,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmt,
      date: request.body.date
    });

    console.log(request.body.products); // Fix: Corrected console log

    if (!order) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    }

    // Fix: Ensure products exist before processing
    for (let i = 0; i < request.body.products.length; i++) {
      let product = await ProductModel.findById(request.body.products[i].productId);

      if (!product) {
        return response.status(404).json({
          error: true,
          success: false,
          message: `Product with ID ${request.body.products[i].productId} not found`,
        });
      }

      let newStockCount = parseInt(product.countInStock) - parseInt(request.body.products[i].quantity);
      if (newStockCount < 0) {
        return response.status(400).json({
          error: true,
          success: false,
          message: `Not enough stock for product ID ${product._id}`,
        });
      }

      // Update product stock count
      await ProductModel.findByIdAndUpdate(
        request.body.products[i].productId,
        { countInStock: newStockCount },
        { new: true }
      );
    }

    // Save the order
    order = await order.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: "Thank You, Your order is placed",
      order: order,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


export const updateOrderStatusController = async (request, response) => {

  try {


    const { id, order_status } = request.body


    const updateOrder = await OrderModel.updateOne({
      _id: id,

    }, {
      order_status: order_status,
    }
      , { new: true }
    )

    return response.status(200).json({
      message: "Updated status",
      error: true,
      success: false,
      data : updateOrder
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }

}
