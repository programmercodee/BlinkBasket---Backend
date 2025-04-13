import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { createCategory, deleteCategory, getCategories, getCategoriesCount, getCategory, getSubCategoriesCount, removeImageFromCloudinary, updateCategory, uploadCategoryImage } from "../controllers/category.controller.js";


const categoryRouter = Router()

// "auth.js" means authrized user only or only login user can do.
categoryRouter.post('/uploadCategoryImage', auth, upload.array('images'), uploadCategoryImage)
categoryRouter.post('/create', auth, createCategory)
categoryRouter.get('/', getCategories)
categoryRouter.get('/get/count', getCategoriesCount)
categoryRouter.get('/get/count/subCat', getSubCategoriesCount)
categoryRouter.get('/:id', getCategory)
categoryRouter.delete('/deleteImage', removeImageFromCloudinary)
categoryRouter.delete('/:id', auth, deleteCategory)
categoryRouter.put('/:id', auth, updateCategory)

export default categoryRouter;