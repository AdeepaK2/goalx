import mongoose from "mongoose";
import exp from "node:constants";

const MONGODB_URI = process.env.MONGO_DB_URI as string;

const connect = async ()=>{
    const connectionState=mongoose.connection.readyState;
    if(connectionState===1){
        console.log("DB already connected");
        return;
    }
    if (connectionState===2){
        console.log("DB connecting");
        return;
    }

    try {
        mongoose.connect(MONGODB_URI,{
             dbName: "test",
              bufferCommands: true
        });
        console.log("DB connected");
    }catch (error: any ){
        console.error("Error connecting to the database:", error);
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

export  default connect;

//SINCH_ACCESSKEY=a17782a7-8803-4002-a996-36a2368ca8e8
//SINCH_PROJECTID=b8fcbbdc-b5a5-490b-a9f6-49fe86df0215