import mongoose from "mongoose";


const mentorSchema=new mongoose.Schema({
    name:{
        type:String,required:true,trim:true,
    },
    subject:{
        type:String, required:true,
    },
    mentorId:{
        type:String, required:true,unique:true,
    },
    student:[{
        type:mongoose.Schema.Types.ObjectId,ref:"student"
    }]
})
const Mentor=mongoose.model("Mentor",mentorSchema)
export{Mentor};