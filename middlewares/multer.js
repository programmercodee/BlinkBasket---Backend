import multer from 'multer'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    //file name pass with the Rename, e.g: one.jpg it will rename include with Date.now like '28-2-202_one.jpg' --final file name. 
    cb(null, `${Date.now()}_${file.originalname}`)
    // imageArr.push(`${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({ storage: storage })

export default upload;