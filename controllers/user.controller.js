import UserModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedRefreshToken from '../utils/generatedRefreshToken.js';
// import cloudinary and install from 'npm i cloudinary'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { sign } from 'crypto';

//configuring the cloudinary.
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true
})

// This is for user register 
export async function registerUserController(request, response) {
  try {
    let user;

    const { name, email, password } = request.body

    // If user not provide this field then.. this message will display 
    if (!name || !email || !password) {
      return response.status(400).json({
        message: "provide name , email and password",
        error: true,
        success: false
      })
    }

    // checking user existions
    user = await UserModel.findOne({ email: email })

    if (user) {
      return response.json({
        message: "User already registered with this email",
        error: true,
        success: false
      })
    }

    // sending 6 digit code on email 
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();


    // encryption of user password in hash code 
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)


    user = new UserModel({
      email: email,
      password: hashPassword,
      name: name,
      otp: verifyCode,
      otpExpires: Date.now() + 600000
    })

    await user.save()

    // Send verification email 
    await sendEmailFun(email, "Verify email from BlinkBasket Pvt Ltd", "", VerificationEmail(name, verifyCode));



    //Create a JWT token for verification purposes
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    )

    return response.status(200).json({
      success: true,
      error: false,
      message: "User registered successfully! Please verify your email",
      token: token //Optional : include this if needed for verification
    })


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

// export async function authWithGoogle(request, response) {
//   const { name, email, password, avatar, mobile, role } = request.body

//   try {

//     const existingUser = await UserModel.findOne({ email: email })
//     if (existingUser) {
//       const user = await UserModel.create({
//         name: name,
//         email: email,
//         password: password,
//         avatar: avatar,
//         mobile: mobile,
//         role: role,
//         verify_email: true,
//         signUpWithGoogle: true
//       });

//       await user.save()


//       //gereneting user login token
//       const accessToken = await generatedAccessToken(user._id)
//       const refreshToken = await generatedRefreshToken(user._id)

//       await UserModel.findByIdAndUpdate(user?._id, {
//         last_login_date: new Date()
//       })

//       //creating cookie for maintaing user login.
//       const cookiesOption = {
//         httpOnly: true,
//         secure: true,
//         sameSite: "None"
//       }
//       response.cookie('accessToken', accessToken, cookiesOption)
//       response.cookie('refreshToken', refreshToken, cookiesOption)


//       return response.json({
//         message: "Login successfully",
//         error: false,
//         success: true,
//         data: {
//           accessToken,
//           refreshToken
//         }
//       })

//     } else {

//        //gereneting user login token
//        const accessToken = await generatedAccessToken(existingUser._id)
//        const refreshToken = await generatedRefreshToken(existingUser._id)
 
//        await UserModel.findByIdAndUpdate(existingUser?._id, {
//          last_login_date: new Date()
//        })
 
//        //creating cookie for maintaing user login.
//        const cookiesOption = {
//          httpOnly: true,
//          secure: true,
//          sameSite: "None"
//        }
//        response.cookie('accessToken', accessToken, cookiesOption)
//        response.cookie('refreshToken', refreshToken, cookiesOption)
 
 
//        return response.json({
//          message: "Login successfully",
//          error: false,
//          success: true,
//          data: {
//            accessToken,
//            refreshToken
//          }
//        })

//     }

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     })
//   }
// }


// Email verification with otp 


export async function authWithGoogle(request, response) {
  const { name, email, password, avatar, mobile, role } = request.body;

  try {
    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) { // Fix: Check for no user and create one
      const user = await UserModel.create({
        name,
        email,
        password,
        avatar,
        mobile,
        role,
        verify_email: true,
        signUpWithGoogle: true
      });

      if (!user || !user._id) { // Fix: Ensure user is created
        throw new Error("User creation failed");
      }

      await UserModel.findByIdAndUpdate(user._id, { last_login_date: new Date() });

      // Generating user login token
      const accessToken = await generatedAccessToken(user._id);
      const refreshToken = await generatedRefreshToken(user._id);

      // Creating cookie for maintaining user login
      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
      };
      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Login successfully",
        error: false,
        success: true,
        data: { accessToken, refreshToken }
      });

    } else {
      if (!existingUser || !existingUser._id) { // Fix: Ensure existing user has an ID
        throw new Error("User not found or missing ID");
      }

      // Generating user login token
      const accessToken = await generatedAccessToken(existingUser._id);
      const refreshToken = await generatedRefreshToken(existingUser._id);

      await UserModel.findByIdAndUpdate(existingUser._id, { last_login_date: new Date() });

      // Creating cookie for maintaining user login
      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
      };
      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Login successfully",
        error: false,
        success: true,
        data: { accessToken, refreshToken }
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}



export async function verifyEmailController(request, response) {
  try {
    // getting email and otp from frontend 
    const { email, otp } = request.body

    const user = await UserModel.findOne({ email: email })

    if (!user) {
      return response.status(400).json({
        message: "User not found",
        error: true,
        success: false
      })
    }

    // checking otp validity is true or false 
    const isCodeValid = user.otp === otp;
    const otpExpires = user.otpExpires > Date.now();

    if (isCodeValid && otpExpires) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;

      await user.save();
      return response.status(200).json({
        message: "Email verified",
        error: false,
        success: true
      })
    }
    else if (!isCodeValid) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false
      })
    }
    else {
      return response.status(400).json({
        message: "OTP expxpired",
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


//User logIn functional 
export async function loginUserController(request, response) {
  try {

    const { email, password } = request.body


    const user = await UserModel.findOne({ email: email })

    if (!user) {
      return response.status(400).json({
        message: "User not register.",
        error: true,
        success: false
      })
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact to admin.",
        error: true,
        success: false
      })
    }
    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "Your Email is not verify yet please verify your email first.",
        error: true,
        success: false
      })
    }

    //validating user password.
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
      return response.status(400).json({
        message: "Password is incorrect!, Please check the password.",
        error: true,
        success: false
      })
    }

    //gereneting user login token
    const accessToken = await generatedAccessToken(user._id)
    const refreshToken = await generatedRefreshToken(user._id)

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date()
    })

    //creating cookie for maintaing user login.
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }
    response.cookie('accessToken', accessToken, cookiesOption)
    response.cookie('refreshToken', refreshToken, cookiesOption)


    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken
      }
    })

  } catch (error) {

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })

  }
}


//User logout functional 
export async function logoutController(request, response) {
  try {

    const userid = request.userId // auth middleware

    const cookiesOption = {
      httpOnly: true,
      sucure: true,
      sameSite: "None"
    }

    //clearing cookie for user logout.
    response.clearCookie("accessToken", cookiesOption)
    response.clearCookie("refreshToken", cookiesOption)

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
      access_token: ""
    })


    return response.json({
      message: "Logout successfully",
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


//image upload cloudinary
var imagesArr = []
export async function userAvatarController(request, response) {
  try {
    imagesArr = []
    const userId = request.userId
    const image = request.files

    const user = await UserModel.findOne({ _id: userId })

    // remove first image from cloudinary
    const imgUrl = user.avatar
    const urlArr = imgUrl.split("/");
    const avatar_image = urlArr[urlArr.length - 1];
    const imageName = avatar_image.split(".")[0];
    if (imageName) {
      const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {
          console.log(error, result)
        }
      )
    }

    if (!user) {
      return response.status(500).json({
        message: "User not found!!",
        error: true,
        success: false
      })
    }

    console.log(image)

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

    user.avatar = imagesArr[0]
    await user.save()

    //sending back to the user.
    return response.status(200).json({
      _id: userId,
      avtar: imagesArr[0]
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


//update user details
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId // auth middleware
    const { name, email, mobile, password } = request.body

    const userExist = await UserModel.findById(userId)
    if (!userExist) {
      return response.status(400).send("The user cannot be Updated!!!")
    }

    //new email verification.
    let verifyCode = "";
    if (email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }


    //Hashing the new password of user.
    let hashPassword = ""
    if (password) {
      const salt = await bcrypt.genSalt(10)
      hashPassword = await bcrypt.hash(password, salt)
    } else {
      hashPassword = userExist.password
    }


    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: email,
        verify_email: email !== userExist.email ? false : true,
        password: hashPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpires: verifyCode !== "" ? Date.now() + 600000 : ''
      },
      { new: true }
    )

    //sending verification email
    if (email !== userExist.email) {
      //sending verification mail
      await sendEmailFun({
        sendTo: email,
        subject: "Verification email from BlinkBasket Pvt Ltd.",
        text: "",
        html: VerificationEmail(name, verifyCode)
      })
    }

    return response.json({
      message: "User Updated Successfully.",
      error: false,
      success: true,
      user: updateUser
    })

  } catch (error) {

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })

  }
}

//forgot Password
export async function forgotPasswordController(request, response) {
  try {

    const { email } = request.body

    const user = await UserModel.findOne({ email: email })
    if (!user) {
      return response.status(400).json({
        message: "Email not found!",
        error: true,
        success: false
      })
    }

    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = verifyCode
    user.otpExpires = Date.now() + 600000;

    await user.save();



    // Send verification email 
    await sendEmailFun(email, "Verify email from BlinkBasket Pvt Ltd , to reset your password!", "", VerificationEmail(user.name, verifyCode));



    return response.json({
      message: "Check your email.",
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

//forgot Password OTP verification.
export async function verifyForgotPasswordOtp(request, response) {

  try {

    const { email, otp } = request.body

    const user = await UserModel.findOne({ email: email })
    if (!user) {
      return response.status(400).json({
        message: "Email not found!",
        error: true,
        success: false
      })
    }

    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide required fields email , otp.",
        error: true,
        success: false
      })
    }

    if (otp !== user.otp) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false
      })
    }

    const currentTime = new Date().toString();
    if (user.otpExpires < currentTime) {
      return response.status(400).json({
        message: "OTP is expired!",
        error: true,
        success: false
      })
    }

    user.otp = ""
    user.otpExpires = ""

    await user.save()

    return response.status(200).json({
      message: "Verify OTP Successfully",
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

// reset password
export async function resetPassword(request, response) {
  try {

    const { email, newPassword, confirmPassword } = request.body
    if (!email || !newPassword || !confirmPassword) {
      return response.status(500).json({
        message: 'Provide required fields email , newPassword & confirmPassword.',
        error: true,
        success: false
      })
    }

    const user = await UserModel.findOne({ email: email })
    if (!user) {
      return response.status(400).json({
        message: "Email not found!",
        error: true,
        success: false
      })
    }


    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "newPassword and confirmPassword must be same.",
        error: true,
        success: false
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(confirmPassword, salt)

    user.password = hashpassword
    await user.save()

    return response.status(200).json({
      message: "Password updated successfully.",
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


//refresh token controler
export async function refreshToken(request, response) {
  try {

    const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1] //[Bearer token]

    if (!refreshToken) {
      return response.status(401).json({
        message: "Invalid token",
        error: true,
        success: false
      })
    }

    const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)

    if (!verifyToken) {
      return response.status(401).json({
        message: "token is expired.",
        error: true,
        success: false
      })
    }

    const userId = verifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId)

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }

    response.cookie('accessToken', newAccessToken, cookiesOption)

    return response.status(200).json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: {
        accesstoken: newAccessToken
      }
    })


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//get login user details
export async function userDetails(request, response) {
  try {
    const userId = request.userId;
    const user = await UserModel.findById(userId).select('-password -refresh_token').populate('address_details');

    console.log(user)

    if (!user) {
      return response.status(500).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "User details",
      data: user,
      error: false,
      success: true
    });

  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false
    });
  }
}