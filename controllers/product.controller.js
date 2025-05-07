import ProductModel from "../models/product.model.js";

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import ProductRAMSModel from "../models/productRAMS.js";
import ProductWEIGHTModel from "../models/productWEIGHT.js";
import ProductSIZEModel from "../models/productSIZE.js";

//configuring the cloudinary.
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true
})



//image upload cloudinary
var imagesArr = []
// export async function uploadCategoryImage(request, response) {
//   try {
//     imagesArr = []

//     const image = request.files

//     // console.log(image)

//     const options = {
//       use_filename: true,
//       uniqe_filename: false,
//       overwrite: false
//     }

//     //selecting multiple images from the user
//     for (let i = 0; i < request.files.length; i++) {
//       //uploading image on cloudinary.
//       const img = await cloudinary.uploader.upload(
//         image[i].path,
//         options,


//         //callback function
//         function (error, result) {
//           console.log(result)
//           imagesArr.push(result.secure_url);
//           //deleting the image from "upload" folder for uploading on "cloudinary"
//           fs.unlinkSync(`uploads/${request.files[i].filename}`);
//           // console.log(request.files[i].filename)
//         }
//       )
//     }


//     //sending back to the user.
//     return response.status(200).json({
//       //this "images" is used in "category.router.js"
//       images: imagesArr,
//     })



//   } catch (error) {

//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     })

//   }
// }


//create product



export async function uploadCategoryImage(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedUrls = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'categories',
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      uploadedUrls.push(result.secure_url);
    }

    return res.status(200).json({ images: uploadedUrls });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return res.status(500).json({
      message: 'Cloudinary upload failed',
      error: error.message,
      success: false,
    });
  }
}


export async function createProduct(request, response) {
  try {

    let product = new ProductModel({
      name: request.body.name,
      description: request.body.description,
      images: imagesArr,
      brand: request.body.brand,
      price: request.body.price,
      oldPrice: request.body.oldPrice,
      catName: request.body.catName,
      catId: request.body.catId,
      category: request.body.category,
      subCat: request.body.subCat,
      subCatId: request.body.subCatId,
      thirdsubCat: request.body.thirdsubCat,
      thirdsubCatId: request.body.thirdsubCatId,
      countInStock: request.body.countInStock,
      rating: request.body.rating,
      isFeatured: request.body.isFeatured,
      discount: request.body.discount,
      productRam: request.body.productRam,
      size: request.body.size,
      productWeight: request.body.productWeight,
    })

    product = await product.save()

    if (!product) {
      response.status(500).json({
        message: "Product Not Created!",
        error: true,
        success: false
      })
    }

    imagesArr = []

    return response.status(200).json({
      message: "Product Created successfully.",
      error: false,
      success: true,
      product: product
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get all products
export async function getAllProducts(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage)
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find().populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();


    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Found",
      error: false,
      success: true,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get products by categoty ID
export async function getAllProductsByCatId(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find(
      {
        catId: (request.params.id)
      }
    ).populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    console.log(products)

    // getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Founds",
      error: true,
      success: false,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get products by categoty name
export async function getAllProductsByCatName(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find(
      {
        catName: request.query.catName
      }
    ).populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();


    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Found",
      error: true,
      success: false,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get products by sub categoty ID
export async function getAllProductsBySubCatId(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find(
      {
        subCatId: request.params.id
      }
    ).populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();



    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Foundss",
      error: true,
      success: false,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get products by sub categoty name
export async function getAllProductsBySubCatName(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find(
      {
        subCat: request.query.subCat
      }
    ).populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();


    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Found",
      error: true,
      success: false,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}



//get products by sub-sub categoty ID
export async function getAllProductsByThirdLevelCat(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find(
      {
        thirdsubCatId: request.params.id
      }
    ).populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();


    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Found",
      error: true,
      success: false,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get products by sub-sub categoty name
export async function getAllProductsByThirdLevelCatName(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find(
      {
        thirdsubCat: request.query.thirdsubCat
      }
    ).populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();


    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Found",
      error: true,
      success: false,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get all products
export async function getAllProductsByPrice(request, response) {
  try {

    let productList = []

    //getting all related product of single category
    if (request.query.catId !== "" && request.query.catId !== undefined) {
      const productListArr = await ProductModel.find(
        {
          catId: request.query.catId,
        }).populate("category")

      productList = productListArr;
      // console.log(productList)
    }

    //getting all related product of single sub category
    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
      const productListArr = await ProductModel.find(
        {
          subCatId: request.query.subCatId,
        }).populate("category")

      productList = productListArr;
    }


    //getting all related product of single sub-sub or third level category
    if (request.query.thirdsubCatId !== "" && request.query.thirdsubCatId !== undefined) {
      const productListArr = await ProductModel.find(
        {
          thirdsubCatId: request.query.thirdsubCatId,
        }).populate("category")

      productList = productListArr;
    }

    const filteredProducts = productList.filter((product) => {
      // console.log(request.query.maxPrice)
      if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
        return false
      }
      if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
        return false
      }
      return true
    })



    return response.status(200).json({
      error: false,
      success: true,
      products: filteredProducts,
      totalPages: 0,
      page: 0
    })


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get products by rating
export async function getAllProductsByRating(request, response) {
  try {
    //page per view only
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage)

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page Not Found",
        error: true,
        success: false
      })
    }

    let products = []
    if (request.query.catId !== undefined) {
      products = await ProductModel.find(
        {
          rating: request.query.rating,
          catId: request.query.catId,
          // subCatId: request.query.subCatId,
          // thirdsubCatId: request.query.thirdsubCatId
        }
      ).populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

    }

    if (request.query.subCatId !== undefined) {
      products = await ProductModel.find(
        {
          rating: request.query.rating,
          // catId: request.query.catId,
          subCatId: request.query.subCatId,
          // thirdsubCatId: request.query.thirdsubCatId
        }
      ).populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

    }

    if (request.query.thirdsubCatId !== undefined) {
      products = await ProductModel.find(
        {
          rating: request.query.rating,
          // catId: request.query.catId,
          // subCatId: request.query.subCatId,
          thirdsubCatId: request.query.thirdsubCatId
        }
      ).populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

    }



    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Found",
      error: true,
      success: false,
      products: products,
      //page per view only
      totalPages: totalPages,
      page: page
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//get all product count
export async function getProductsCount(request, response) {
  try {

    const productsCount = await ProductModel.countDocuments()

    if (!productsCount) {
      return response.status(500).json({
        message: "Products not found!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Products founds",
      error: false,
      success: true,
      productsCount: productsCount
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get all features products
export async function getAllFeaturedProducts(request, response) {
  try {


    const products = await ProductModel.find(
      {
        isFeatured: true
      }
    ).populate("category")

    //getting all products
    // const products = await ProductModel.find();

    if (!products) {
      return response.status(500).json({
        message: "Product Not Found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Found",
      error: true,
      success: false,
      products: products,
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//delete single products
export async function deleteProduct(request, response) {
  try {

    const products = await ProductModel.findById(request.params.id).populate("category")
    if (!products) {
      return response.status(404).json({
        message: "Product not found!",
        error: true,
        success: false
      })
    }

    const images = products.images
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

    const deleteProducts = await ProductModel.findByIdAndDelete(request.params.id)
    if (!deleteProducts) {
      return response.status(404).json({
        message: "Product not deleted!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product deleted Successfully",
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


//delete Multiple products
export async function deleteMultipleProduct(request, response) {
  try {

    const { ids } = request.body

    if (!ids || !Array.isArray(ids)) {
      return response.status(404).json({
        message: "Invalid Input!!",
        error: true,
        success: false
      })
    }


    for (let i = 0; i < ids?.lenght; i++) {
      const product = await ProductModel.findById(ids[i])
      const images = product.images

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

    }

    try {

      await ProductModel.deleteMany({ _id: { $in: ids } })

      return response.status(200).json({
        message: "Product delete successfully",
        error: true,
        success: false
      })

    } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false
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


//get single product
export async function getProduct(request, response) {
  try {

    const product = await ProductModel.findById(request.params.id).populate("category")

    if (!product) {
      return response.status(404).json({
        message: "Product not found!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      error: false,
      success: true,
      product: product
    })


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//image remove cloudinary
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


//update products
export async function updateProduct(request, response) {
  try {

    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        description: request.body.description,
        images: request.body.images,
        brand: request.body.brand,
        price: request.body.price,
        oldPrice: request.body.oldPrice,
        catName: request.body.catName,
        catId: request.body.catId,
        subCat: request.body.subCat,
        subCatId: request.body.subCatId,
        thirdsubCat: request.body.thirdsubCat,
        thirdsubCatId: request.body.thirdsubCatId,
        category: request.body.category,
        countInStock: request.body.countInStock,
        rating: request.body.rating,
        isFeatured: request.body.isFeatured,
        discount: request.body.discount,
        productRam: request.body.productRam,
        size: request.body.size,
        productWeight: request.body.productWeight,
        dateCreated: request.body.dateCreated,
      },
      { new: true }
    )

    if (!product) {
      return response.status(404).json({
        message: "Product is not updated!!",
        error: true,
        success: false
      })
    }

    imagesArr = []


    return response.status(200).json({
      message: "Product is updated Successfully",
      error: false,
      success: true,
      product: product
    })



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//create product RAMS
export async function createProductRAMS(request, response) {
  try {

    let productRAMS = new ProductRAMSModel({
      name: request.body.name
    })

    productRAMS = await productRAMS.save()

    if (!productRAMS) {
      response.status(500).json({
        message: "Product RAMs Not Created!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product RAMs Created successfully.",
      error: false,
      success: true,
      productRAMS: productRAMS
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//delete single products RAMS
export async function deleteProductRAMS(request, response) {
  try {

    const productRAMS = await ProductRAMSModel.findById(request.params.id)
    if (!productRAMS) {
      return response.status(404).json({
        message: "Product RAM not found!",
        error: true,
        success: false
      })
    }


    const deleteProductRAMS = await ProductRAMSModel.findByIdAndDelete(request.params.id)
    if (!deleteProductRAMS) {
      return response.status(404).json({
        message: "Product RAMS not deleted!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product RAMS deleted Successfully",
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


//delete Multiple products RAMS
export async function deleteMultipleProductRAMS(request, response) {
  try {

    const { ids } = request.body

    if (!ids || !Array.isArray(ids)) {
      return response.status(404).json({
        message: "Invalid Input!!",
        error: true,
        success: false
      })
    }


    try {

      await ProductRAMSModel.deleteMany({ _id: { $in: ids } })

      return response.status(200).json({
        message: "Product Rams delete successfully",
        error: true,
        success: false
      })

    } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false
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

//update products RAMS
export async function updateProductRAMS(request, response) {
  try {

    const productRam = await ProductRAMSModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    )

    if (!productRam) {
      return response.status(404).json({
        message: "Product Rams is not updated!!",
        error: true,
        success: false
      })
    }



    return response.status(200).json({
      message: "Product is updated Successfully",
      error: false,
      success: true,
      product: productRam
    })



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get Rams
export async function getProductRAMS(request, response) {
  try {

    const productRams = await ProductRAMSModel.find();

    if (!productRams) {
      return response.status(404).json({
        message: "Not found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product found Successfully",
      error: false,
      success: true,
      data: productRams
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get Rams By ID
export async function getProductRAMSById(request, response) {
  try {

    const productRams = await ProductRAMSModel.findById(request.params.id);

    if (!productRams) {
      return response.status(404).json({
        message: "Not found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product founds Successfully",
      error: false,
      success: true,
      data: productRams
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}




//create product WEIGHT
export async function createProductWEIGHT(request, response) {
  try {

    let productWeight = new ProductWEIGHTModel({
      name: request.body.name
    })

    productWeight = await productWeight.save()

    if (!productWeight) {
      response.status(500).json({
        message: "Product Weight Not Created!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Weight Created successfully.",
      error: false,
      success: true,
      productWeight: productWeight
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//delete single products WEIGHT
export async function deleteProductWEIGHT(request, response) {
  try {

    const productWeight = await ProductWEIGHTModel.findById(request.params.id)
    if (!productWeight) {
      return response.status(404).json({
        message: "Product Weight not found!",
        error: true,
        success: false
      })
    }


    const deleteProductWeight = await ProductWEIGHTModel.findByIdAndDelete(request.params.id)
    if (!deleteProductWeight) {
      return response.status(404).json({
        message: "Product Weight not deleted!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Weight deleted Successfully",
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


//delete Multiple products WEIGHT
export async function deleteMultipleProducWEIGHT(request, response) {
  try {

    const { ids } = request.body

    if (!ids || !Array.isArray(ids)) {
      return response.status(404).json({
        message: "Invalid Input!!",
        error: true,
        success: false
      })
    }


    try {

      await ProductWEIGHTModel.deleteMany({ _id: { $in: ids } })

      return response.status(200).json({
        message: "Product Weight delete successfully",
        error: true,
        success: false
      })

    } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false
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

//update products WEIGHT
export async function updateProductWEIGHT(request, response) {
  try {

    const productWeight = await ProductWEIGHTModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    )

    if (!productWeight) {
      return response.status(404).json({
        message: "Product Weight is not updated!!",
        error: true,
        success: false
      })
    }



    return response.status(200).json({
      message: "Product is updated Successfully",
      error: false,
      success: true,
      product: productWeight
    })



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get WEIGHT
export async function getProductWEIGHT(request, response) {
  try {

    const productWeight = await ProductWEIGHTModel.find();

    if (!productWeight) {
      return response.status(404).json({
        message: "Not found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product found Successfully",
      error: false,
      success: true,
      data: productWeight
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get WEIGHT By ID
export async function getProductWEIGHTById(request, response) {
  try {

    const productWeight = await ProductWEIGHTModel.findById(request.params.id);

    if (!productWeight) {
      return response.status(404).json({
        message: "Not found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product founds Successfully",
      error: false,
      success: true,
      data: productWeight
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get filter By ID
// export async function filters(request, response) {
//   try {

//     const { catId, subCatId, thirdsubCatId, minPrice, maxPrice, rating, page, limit } = request.body

//     const filters = {}

//     if (catId?.lenght) {
//       filters.catId = { $in: catId }
//     }

//     if (subCatId?.lenght) {
//       filters.subCatId = { $in: subCatId }
//     }

//     if (thirdsubCatId?.lenght) {
//       filters.thirdsubCatId = { $in: thirdsubCatId }
//     }

//     if (minPrice || maxPrice) {
//       filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity }
//     }

//     if (rating?.lenght) {
//       filters.rating = { $in: rating }
//     }

//     try {


//       const products = await ProductModel.find(filters).populate("category").skip((page - 1) * limit ).limit(parseInt(limit))

//       const total = await ProductModel.countDocuments(filters)

//       return response.status(200).json({
//         message: "Filters done",
//         error: false,
//         success: true,
//         products: products,
//         total: total,
//         page: parseInt(page),
//         totalPage: Math.ceil(total / limit)
//       })


//     } catch (error) {
//       return response.status(500).json({
//         message: error.message || error,
//         error: true,
//         success: false
//       })
//     }


//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     })
//   }
// }


export async function filters(request, response) {
  try {
    const { catId, subCatId, thirdsubCatId, minPrice, maxPrice, rating, page = 1, limit = 10 } = request.body;

    const filters = {};

    if (catId?.length) {
      filters.catId = { $in: catId };
    }

    if (subCatId?.length) {
      filters.subCatId = { $in: subCatId };
    }

    if (thirdsubCatId?.length) {
      filters.thirdsubCatId = { $in: thirdsubCatId };
    }

    if (minPrice || maxPrice) {
      filters.price = { $gte: Number(minPrice) || 0, $lte: Number(maxPrice) || Infinity };
    }

    if (rating?.length) {
      filters.rating = { $in: rating };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    try {
      const products = await ProductModel.find(filters)
        .populate("category")
        .skip(skip)
        .limit(parsedLimit);

      const total = await ProductModel.countDocuments(filters);

      return response.status(200).json({
        message: "Filters applied successfully",
        error: false,
        success: true,
        products,
        total,
        page: Number(page),
        totalPage: Math.ceil(total / parsedLimit),
      });
    } catch (error) {
      return response.status(500).json({
        message: error.message || "Internal server error",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}









//create product Size
export async function createProductSize(request, response) {
  try {

    let productSize = new ProductSIZEModel({
      name: request.body.name
    })

    productSize = await productSize.save()

    if (!productSize) {
      response.status(500).json({
        message: "Product Size Not Created!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product Size Created successfully.",
      error: false,
      success: true,
      productSize: productSize
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//delete single products Size
export async function deleteProductSize(request, response) {
  try {

    const productSize = await ProductSIZEModel.findById(request.params.id)
    if (!productSize) {
      return response.status(404).json({
        message: "Product size not found!",
        error: true,
        success: false
      })
    }


    const deleteProductSize = await ProductSIZEModel.findByIdAndDelete(request.params.id)
    if (!deleteProductSize) {
      return response.status(404).json({
        message: "Product size not deleted!",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product size deleted Successfully",
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


//delete Multiple products Size
export async function deleteMultipleProductSize(request, response) {
  try {

    const { ids } = request.body

    if (!ids || !Array.isArray(ids)) {
      return response.status(404).json({
        message: "Invalid Input!!",
        error: true,
        success: false
      })
    }


    try {

      await ProductSIZEModel.deleteMany({ _id: { $in: ids } })

      return response.status(200).json({
        message: "Product size delete successfully",
        error: true,
        success: false
      })

    } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false
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

//update products Size
export async function updateProductSize(request, response) {
  try {

    const productSize = await ProductSIZEModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    )

    if (!productSize) {
      return response.status(404).json({
        message: "Product size is not updated!!",
        error: true,
        success: false
      })
    }



    return response.status(200).json({
      message: "Product is updated Successfully",
      error: false,
      success: true,
      product: productSize
    })



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get Size
export async function getProductSize(request, response) {
  try {

    const productSize = await ProductSIZEModel.find();

    if (!productSize) {
      return response.status(404).json({
        message: "Not found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product found Successfully",
      error: false,
      success: true,
      data: productSize
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get Size By ID
export async function getProductSizeById(request, response) {
  try {

    const productSize = await ProductSIZEModel.findById(request.params.id);

    if (!productSize) {
      return response.status(404).json({
        message: "Not found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      message: "Product founds Successfully",
      error: false,
      success: true,
      data: productSize
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export async function searchProductController(request, response) {
  try {
    // const query = request.query.q;

    const {query,page , limit} = request.body;

    if(!query){
      return response.status(400).json({
        message: "Query is required",
        error: true,
        success: false
      });
    }


    const items = await ProductModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { catName: { $regex: query, $options: "i" } },
        { subCat: { $regex: query, $options: "i" } },
        { thirdsubCat: { $regex: query, $options: "i" } }
      ]

    }).populate("category")

    const total = await items?.length

    if (!items) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false
      });
    }

    return response.status(200).json({
      message: "Products found",
      error: false,
      success: true,
      products: items,
      total: total,
      page: parseInt(page),
      totalPage: Math.ceil(total / limit)
    });


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}




