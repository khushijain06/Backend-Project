//require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./env",
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is runnong on port ${process.env.PORT}`);
        
    })
  })
  .catch((err) => {
    console.log("Mongo connect fail", err);
  });

/*
const app = express()
(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log(error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`APP ON ${process.env.PORT}`);
            
        })
    }
    catch(error){
        console.error("Error: ",error)
        throw error
    }
}
    )
*/
