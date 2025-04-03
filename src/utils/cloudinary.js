import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    const uploadCloudinary= async (localpath) =>{
        try{
      if(!localpath) return null;
       const uploadResult =   await cloudinary.uploader
       .upload(
           localpath, {
               resource_type: 'auto',
           })
         fs.unlinkSync(localpath) 
      //  console.log("file uploaded",uploadResult.url)
       return uploadResult
        }
        catch(error){
            fs.unlinkSync(localpath) //remove local saved temp file   
            console.log("error file upload" , error);
            return null;
        }}
      
        export {uploadCloudinary}
    // Upload an image
     
