import { Router } from "express";
import auth from "../middlewares/auth.js";
import { createOrderController, getOrderDetailsController, updateOrderStatusController } from "../controllers/order.controller.js";


const orderRouter = Router();

orderRouter.post('/create',auth,createOrderController)
orderRouter.get('/order-list',auth,getOrderDetailsController)
orderRouter.put('/order-status/:id',auth,updateOrderStatusController)


export default orderRouter;