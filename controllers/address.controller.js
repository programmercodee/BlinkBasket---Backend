import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const addAddressController = async (request, response) => {
  try {

    const { address_line, city, state, pincode, country, mobile, userId, landmark, addressType } = request.body


    // if (!address_line || city || state || pincode || country || mobile || userId) {
    //   return response.status(500).json({
    //     message: "Please provide all the fields!",
    //     error: true,
    //     success: false
    //   })
    // }

    const address = new AddressModel({
      address_line,
      city,
      state,
      pincode,
      country,
      landmark,
      addressType,
      mobile,
      userId,
    })



    const savedAddress = await address.save()

    const aa = await UserModel.updateOne({ _id: userId }, {
      $push: {
        address_details: savedAddress?._id
      }
    })


    return response.status(200).json({
      message: "Address Add Successfully",
      error: false,
      success: true,
      data: savedAddress
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


export const getAddressController = async (request, response) => {
  try {

    const addresses = await AddressModel.find({ userId: request?.query?.userId });

    console.log(addresses)
    if (!addresses) {
      return response.status(500).json({
        message: "Address not found!!",
        error: true,
        success: false
      })
    }
    else {
      const address_details = await UserModel.updateOne({ _id: request?.query?.userId }, {
        $push: {
          addresses: addresses?.id
        }
      }


      )

      // console.log(address_details)

      return response.status(200).json({
        addresses: addresses,
        message: "Address found Successfully",
        error: false,
        success: true,
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

// export const getAddressController = async (request, response) => {
//   try {
//     const addresses = await AddressModel.find({ userId: request?.query?.userId });

//     if (addresses.length === 0) {
//       return response.status(404).json({
//         message: "Address not found!",
//         error: true,
//         success: false
//       });
//     }

//     // Ensure you are pushing the addresses _ids and not the whole address object
//     const updateUser = await UserModel.updateOne({ _id: request?.query?.userId }, {
//       $push: {
//         address_details: { $each: addresses.map(address => address._id) }
//       }
//     });

//     return response.status(200).json({
//       addresses: addresses,
//       message: "Address found successfully",
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false
//     });
//   }
// };

export const deleteAddressController = async (request, response) => {
  try {
    const userId = request.userId //middleware
    const _id = request.params.id

    if (!_id) {
      return response.status(400).json({
        message: "provide _id",
        error: true,
        success: false
      })
    }

    const deleteItem = await AddressModel.deleteOne({ _id: _id, userId: userId })

    if (!deleteItem) {
      return response.status(404).json({
        message: "The address is not found",
        error: true,
        success: false
      })
    }


    return response.status(200).json({
      message: "Address remove",
      success: false,
      success: true,
      data: deleteItem
    })



  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export const getSingleAddressController = async (request, response) => {
  try {
    const id = request.params.id;

    const address = await AddressModel.findOne({ _id: id })

    if (!address) {
      return response.status(404).json({
        message: "Address not found ",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      error: false,
      success: true,
      address: address
    })


  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}



export async function editAddress(request, response) {
  try {

    const id = request.params.id;

    const { address_line1, city, state, pincode, country, mobile, userId, addressType, landmark } = request.body


    const address = await AddressModel.findByIdAndUpdate(
      id,
      {
        address_line1: address_line1,
        city: city,
        state: state,
        pincode: pincode,
        country: country,
        mobile: mobile,
        landmark: landmark,
        addressType: addressType
      },
      { new: true }
    )

    return response.json({
      message: "Address Updated Successfully.",
      error: false,
      success: true,
      address: address
    })

  } catch (error) {

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })

  }
}
