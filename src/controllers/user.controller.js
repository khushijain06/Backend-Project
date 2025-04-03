import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { application } from "express";

const generateAccessAndRefreshTokens = async(userId)=>{
   try {
      const user = await User.findById(userId)
     const accessToken =  user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave :false})
    return {accessToken,refreshToken}
   } catch (error) {
      throw new ApiError(500,"Something went wrong while generating refresh and access token")
   }
}


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
  const existedUser = await User.findOne({    //this findone checks first occurence in db user
    $or :[{username},{email}]  //$or is operator adds or b/w all elem in array passed
   })
   if(existedUser) throw new ApiError(409,"User with email or username already exist")
   const avatarLocalPath =  req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
         coverImageLocalPath = req.files.coverImage[0].path
   } // cover image so that undefined not come if no coverimage given
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file path is required")
   }
  const avatar =  await uploadCloudinary(avatarLocalPath)
  const coverImage = await uploadCloudinary(coverImageLocalPath)
  if(!avatar) throw new ApiError(400,"Avatar file is required")
  // console.log(avatar.url)
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
    new ApiResponse(200,createduser,"User Registered Sucessfully")
 )
})



const loginUser = asyncHandler(async(req,res)=>{
   const {email,username,password} = req.body
   if(!username || !email) {
      throw new ApiError(400,"username or email is required")   //if user not registered then throw err
   }
   //else 
 const user = await  User.findOne({    //await as user is db 
     $or: [{username},{email}]   //check in user db where username or email is present using or
     })
     if(!user) throw new ApiError(404,"User does not eist")
      //we can use by default mogoose funct like findone by capital U-ser {User}  
     // but to acces our defined function like isPasswordcorrect in user.model we need to u-ser{user}
   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid) throw new ApiError(401, "Password incorrect")
   const {accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)
   const loggedInUser =  User.findById(user._id).select("-password -refreshToken")
   const options = {
      httpOnly : true,
      secure : true,
   }

   return res.status(200).
   cookie("accessToken",accessToken,options)
   .cookie("accessToken",refreshToken,options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser, accessToken,
            refreshToken 
         },
         "User logged In Successfullt"
      )
   )
})

const logoutUser = asyncHandler(async(req,res) => {
 await User.findByIdAndUpdate(req.user._id,{
   $set:[
     {
      refreshToken:undefined
     },
     {
      new: true
     }]
  })

  const options = {
   httpOnly : true,
   secure : true,
}
return res
   .status(200).
   clearCookie("accessToken")
   .clearCookie("refreshToken")
   .json(new ApiError(200),{},"User logged out")
})
export  {registerUser,loginUser,logoutUser}