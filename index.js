import express, { request, response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDb.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import myListRouter from './route/mylist.route.js'
import addressRouter from './route/address.route.js'
import { addAddressController, getAddressController } from './controllers/address.controller.js'
import orderRouter from './route/order.route.js'


const app = express()



// app.use(cors())

app.use(cors({
  origin: ['https://admin-panel-taupe-three-49.vercel.app' , 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// app.options('*', cors())
app.use(express.json())

app.use(cookieParser())
app.use(morgan('dev'))
app.use(helmet({
  crossOriginEmbedderPolicy: false
}))

app.get("/", (request, response) => {
  //server to client
  response.json({
    message: "Server is running : " + process.env.PORT
  })
})

app.use('/api/user', userRouter)
app.use('/api/category', categoryRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/myList', myListRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)


connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server is running", process.env.PORT)
  })
})