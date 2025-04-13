import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { createProduct, createProductRAMS, createProductSize, createProductWEIGHT, deleteMultipleProduct, deleteMultipleProductRAMS, deleteMultipleProductSize, deleteMultipleProducWEIGHT, deleteProduct, deleteProductRAMS, deleteProductSize, deleteProductWEIGHT, filters, getAllFeaturedProducts, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLevelCat, getAllProductsByThirdLevelCatName, getProduct, getProductRAMS, getProductRAMSById, getProductsCount, getProductSize, getProductSizeById, getProductWEIGHT, getProductWEIGHTById, removeImageFromCloudinary, updateProduct, updateProductRAMS, updateProductSize, updateProductWEIGHT, uploadCategoryImage } from "../controllers/product.controller.js";


const productRouter = Router()

productRouter.post('/uploadCategoryImage', auth, upload.array('images'), uploadCategoryImage)
productRouter.post('/create', auth, createProduct)
productRouter.get('/getAllProducts', getAllProducts)
productRouter.get('/getAllProductsByCatId/:id', getAllProductsByCatId)
productRouter.get('/getAllProductsByCatName', getAllProductsByCatName)
productRouter.get('/getAllProductsBySubCatId/:id', getAllProductsBySubCatId)
productRouter.get('/getAllProductsBySubCatName', getAllProductsBySubCatName)
productRouter.get('/getAllProductsByThirdLevelCat/:id', getAllProductsByThirdLevelCat)
productRouter.get('/getAllProductsByThirdLevelCatName', getAllProductsByThirdLevelCatName)
productRouter.get('/getAllProductsByPrice', getAllProductsByPrice)
productRouter.get('/getAllProductsByRating', getAllProductsByRating)
productRouter.get('/getAllProductsCount', getProductsCount)
productRouter.get('/getAllFeaturedProducts', getAllFeaturedProducts)
productRouter.delete('/:id', deleteProduct)
productRouter.delete('/deleteMultiple', deleteMultipleProduct)
productRouter.get('/:id', getProduct)
productRouter.delete('/deleteImage', auth, removeImageFromCloudinary)
productRouter.put('/updateProduct/:id', auth, updateProduct)

productRouter.post('/productRAMS/create', auth, createProductRAMS)
productRouter.delete('/productRAMS/:id', deleteProductRAMS)
productRouter.put('/productRAMS/:id', auth, updateProductRAMS)
productRouter.delete('/productRAMS/deleteMultipleRams', deleteMultipleProductRAMS)
productRouter.get('/getproductRAMS/get', getProductRAMS)
productRouter.get('/getproductRAMS/:id', getProductRAMSById)

productRouter.post('/productWeight/create', auth, createProductWEIGHT)
productRouter.delete('/productWeight/:id', deleteProductWEIGHT)
productRouter.put('/productWeight/:id', auth, updateProductWEIGHT)
productRouter.delete('/productWeight/deleteMultipleWeight', deleteMultipleProducWEIGHT)
productRouter.get('/getproductWeight/get', getProductWEIGHT)
productRouter.get('/getproductWeight/:id', getProductWEIGHTById)

productRouter.post('/productSize/create', auth, createProductSize)
productRouter.delete('/productSize/:id', deleteProductSize)
productRouter.put('/productSize/:id', auth, updateProductSize)
productRouter.delete('/productSize/deleteMultipleSize', deleteMultipleProductSize)
productRouter.get('/getproductSize/get', getProductSize)
productRouter.get('/getproductSize/:id', getProductSizeById)

productRouter.post('/filters', filters)

export default productRouter;