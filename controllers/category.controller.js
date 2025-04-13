import CategoryModel from '../models/category.model.js';

// import cloudinary and install from 'npm i cloudinary'
import { v2 as cloudinary } from 'cloudinary';
import { count, error } from 'console';
import fs from 'fs'
import { console } from 'inspector';

//configuring the cloudinary.
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true
})


//image upload cloudinary
var imagesArr = []
export async function uploadCategoryImage(request, response) {
  try {
    imagesArr = []

    const image = request.files

    // console.log(image)

    const options = {
      use_filename: true,
      uniqe_filename: false,
      overwrite: false
    }

    //selecting multiple images from the user
    for (let i = 0; i < request.files.length; i++) {
      //uploading image on cloudinary.
      const img = await cloudinary.uploader.upload(
        image[i].path,
        options,


        //callback function
        function (error, result) {
          console.log(result)
          imagesArr.push(result.secure_url);
          //deleting the image from "upload" folder for uploading on "cloudinary"
          fs.unlinkSync(`uploads/${request.files[i].filename}`);
          // console.log(request.files[i].filename)
        }
      )
    }


    //sending back to the user.
    return response.status(200).json({
      //this "images" is used in "category.router.js"
      images: imagesArr,
    })



  } catch (error) {

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })

  }
}


//create category
export async function createCategory(request, response) {
  try {

    let category = new CategoryModel({
      name: request.body.name,
      images: imagesArr,
      parentId: request.body.parentId,
      parentCatName: request.body.parentCatName
    })

    if (!category) {
      return response.status(500).json({
        message: "Category not created",
        error: true,
        success: false
      })
    }

    category = await category.save()
    imagesArr = []

    return response.status(200).json({
      message: "Category created",
      error: false,
      success: true,
      category: category
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}



// Get categories
export async function getCategories(request, response) {
  try {

    const categories = await CategoryModel.find()
    const categoryMap = {}

    categories.forEach(cat => {
      categoryMap[cat._id] = { ...cat._doc, children: [] }
    })

    const rootCategories = []
    categories.forEach(cat => {
      if (cat.parentId) {
        categoryMap[cat.parentId].children.push(categoryMap[cat._id])
      } else {
        rootCategories.push(categoryMap[cat._id])
      }
    })

    return response.status(200).json({
      error: false,
      success: true,
      data: rootCategories
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// Get categories count
export async function getCategoriesCount(request, response) {
  try {

    const categoryCount = await CategoryModel.countDocuments({ parentId: undefined })
    if (!categoryCount) {
      return response.status(500).json({
        error: true,
        success: false
      })
    } else {
      response.send({
        categoryCount: categoryCount,
      })
    }

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}



// Get sub categories count
export async function getSubCategoriesCount(request, response) {
  try {

    const categories = await CategoryModel.find()
    if (!categories) {
      return response.status(500).json({
        error: true,
        success: false
      })
    } else {
      const subCatList = [];
      for (let cat of categories) {
        if (cat.parentId !== undefined) {
          subCatList.push(cat)
        }
      }

      response.send({
        subCategoryCount: subCatList.length,
      })
    }



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}



// Get a single category by ID
export async function getCategory(request, response) {
  try {


    const category = await CategoryModel.findById(request.params.id)

    if (!category) {
      return response.status(500).json({
        message: "The category with the given ID was not found!!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      error: false,
      success: true,
      category: category
    })


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


// //image remove cloudinary
export async function removeImageFromCloudinary(request, response) {
  const imgUrl = request.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  if (imageName) {
    cloudinary.uploader.destroy(imageName, (error, result) => {
      if (error) {
        return response.status(500).json({
          message: error.message || error,
          error: true,
          success: false
        });
      }

      return response.status(200).json({
        message: "Image removed successfully",
        result: result,
        error: false,
        success: true
      });
    });
  } else {
    return response.status(400).json({
      message: "Invalid image URL",
      error: true,
      success: false
    });
  }
}



//delete category
export async function deleteCategory(request, response) {
  try {

    const category = await CategoryModel.findById(request.params.id)
    const images = category.images
    let img = ""
    for (img of images) {

      const imgUrl = img
      const ulrArr = imgUrl.split("/")
      const image = ulrArr[ulrArr.length - 1]

      const imageName = image.split(".")[0]
      if (imageName) {
        cloudinary.uploader.destroy(imageName,
          (error, result) => {
            // console.log(result)
          })
      }
    }

    const subCategory = await CategoryModel.find({ parentId: request.params.id })

    for (let i = 0; i < subCategory.length; i++) {
      //deleting third level sub category
      const thirdsubCategory = await CategoryModel.find({ parentId: subCategory[i]._id })

      for (let i = 0; i < thirdsubCategory.length; i++) {
        const deletedThirdSubCat = await CategoryModel.findByIdAndDelete(thirdsubCategory[i]._id)
      }
      //deleting second level sub category
      const deletedSubCat = await CategoryModel.findByIdAndDelete(subCategory[i]._id)

    }
    //deleting first level category or main category
    const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id)

    if (!deletedCat) {
      return response.status(500).json({
        message: "Category not deleted",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Category deleted successfully.",
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

// Update an existing category
export async function updateCategory(request, response) {

  try {

    const category = await CategoryModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
        parentId: request.body.parentId,
        parentCatName: request.body.parentCatName

      },
      { new: true }
    );

    if (!category) {
      return response.status(500).json({
        message: "Category not updated ",
        error: true,
        success: false
      })
    }

    imagesArr = []

    response.status(200).json({
      message: "Category updated",
      error: false,
      success: true,
      category: category
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

