
    import { User } from "../models/user.model";
    import { ApiError } from "../utils/ApiError";
    import { asyncHandler } from "../utils/asyncHandler";
    import jwt from 'jsonwebtoken'
    try {
 const verifyJWT = asyncHandler(async(req,res,next)=>{
      const token  =  req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer',"")
    
        if(!token){
            throw new ApiError(401,"unauthorized equest")
        }
    
       const decodeToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      const user =  await User.findById(decodeToken?._id).select("-password -refreshToken")
      if(!user){
        throw new ApiError(401,"invalid Acess Token")
      }
    req.user = user;
    next()
    })
} catch (error) {
    throw new ApiError(401,"Invalid access token")
}   export {verifyJWT}