import CartProductModel from "../models/cart.model.js";

export const addToCartItemController = async (request, response) => {
  try {

    const userId = request.userId
    const { productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      discount,
      size,
      weight,
      ram,
      brand,
      quantity,
      subTotal,
      countInStock } = request.body

    if (!productId) {
      return response.status(402).json({
        message: "provide productId",
        error: true,
        success: false

      })
    }

    const checkItemCart = await CartProductModel.findOne({
      userId: userId,
      productId: productId
    })

    if (checkItemCart) {
      return response.status(400).json({
        message: "Item already in cart"
      })
    }


    const cartItem = new CartProductModel({
      productTitle: productTitle,
      quantity: quantity || 1,
      userId: userId,
      productId: productId,
      image: image,
      rating: rating,
      price: price,
      oldPrice: oldPrice,
      subTotal: subTotal || price,
      countInStock: countInStock,
      discount: discount,
      size: size,
      weight: weight,
      ram: ram,
      brand: brand,
    })

    const save = await cartItem.save()


    return response.status(200).json({
      date: save,
      message: "Item add successfully",
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


export const getCartItemController = async (request, response) => {
  try {

    const userId = request.userId;

    const cartItem = await CartProductModel.find({
      userId: userId
    })

    return response.json({
      data: cartItem,
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

export const updateCateItemQtyController = async (request, response) => {
  try {

    const userId = request.userId
    const { _id, qty, subTotal } = request.body

    console.log(qty)

    if (!_id || !qty) {
      return response.status(400).json({
        message: "provide _id, qty"
      })
    }

    const updateCartitem = await CartProductModel.updateOne({
      _id: _id,
      userId: userId
    }, {
      quantity: qty || 1,
      subTotal: subTotal
    }
      , { new: true }
    )

    return response.json({
      message: "update cart",
      success: true,
      error: false,
      data: updateCartitem

    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId //middleware
    const { id } = request.params

    console.log(id)

    if (!id) {
      return response.status(404).json({
        message: "provide _id",
        error: true,
        success: false
      })
    }

    const deleteCartItem = await CartProductModel.deleteOne({ _id: id, userId: userId })

    if (!deleteCartItem) {
      return response.status(404).json({
        message: "The Provide in the cart is not found",
        error: true,
        success: false
      })
    }


    return response.status(200).json({
      message: "Item remove",
      success: false,
      success: true,
      data: deleteCartItem
    })



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


export const emptyCartController = async (request, response) =>{
  try {
    const userId = request.params.id //middleware

    await CartProductModel.deleteMany({userId : userId })

    return response.status(200).json({
      error : false,
      success : true,

    })
  } catch (error) {
    return response.status(500).json({
      message : error.message || error,
      error : true,
      success : false
    })
  }
}
