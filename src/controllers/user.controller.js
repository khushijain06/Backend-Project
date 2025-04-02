import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req,res)=>{
   const {fullname, email,username,password} = req.body
   console.log(req.body);
   if(
    [fullname,email,username,password].some((field)=>
        field.trim() === "" //check if all values are non empty if one of them is empty then return api errr
    )
   ){
    throw new ApiError(400, "All fields are empty")
   }
  const existedUser =  User.findOne({    //this findone checks first occurence in db user
    $or :[{username},{email}]  //$or is operator adds or b/w all elem in array passed
   })
   if(existedUser) throw new ApiError(409,"User with email or username already exist")
   const avatarLocalPath =  req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
   }
  const avatar =  await uploadCloudinary(avatarLocalPath)
  const coverImage = await uploadCloudinary(coverImageLocalPath)
  if(!avatar) throw new ApiError(400,"Avatar file is required")
   const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
})

 const createduser = await User.findById(user._id).select(
    "-password -refreshToken"  //it removes the elements with - in begin 
 )
 if(!createduser){
    throw new ApiError(500,"Something went wrong while registering the user")
 }
 return res.status(201).json(
    new ApiResponse(200,createduser,"UserRegistered Sucessfully")
 )
})
export  {registerUser}