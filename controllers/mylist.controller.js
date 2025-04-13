import myListModel from "../models/myList.model.js";


export const addToMyListController = async (request, response) => {
  try {
    const userId = request.userId //middleware

    const {
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      brand,
      discount,
    } = request.body;

    //getting user ID and Product ID
    const item = await myListModel.findOne({
      userId: userId,
      productId: productId
    })

    if (item) {
      return response.status(400).json({
        message: "Item already in my list"
      })
    }

    const myList = new myListModel({
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      brand,
      discount,
      userId
    })


    const save = await myList.save();


    return response.status(200).json({
      error: false,
      success: true,
      message: "The product added in the my list."
    })



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export const deleteToMyListController = async (request, response) => {
  try {

    const myListItems = await myListModel.findById(request.params.id);
    console.log(myListItems)
    if (!myListItems) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item with this given id was not found "
      })
    }

    const deletedItem = await myListModel.findByIdAndDelete(request.params.id);

    if (!deletedItem) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item is not deleted"
      })
    }

    return response.status(200).json({
      error: false,
      success: true,
      message: "The item removed from My List"
    })


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export const getMyListController = async (request, response) => {
  try {
    const userId = request.userId;

    const myListItems = await myListModel.find({
      userId: userId
    })

    return response.status(200).json({
      error : false,
      success : true,
      data : myListItems
  })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}