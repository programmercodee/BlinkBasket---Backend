import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addAddressController, deleteAddressController, editAddress, getAddressController, getSingleAddressController } from "../controllers/address.controller.js";


const addressRouter = Router();


addressRouter.post('/add',addAddressController)
addressRouter.get('/get',auth,getAddressController)
addressRouter.delete('/:id',auth,deleteAddressController)

addressRouter.get('/:id',auth,getSingleAddressController)
addressRouter.put('/:id',auth,editAddress)


export default addressRouter;