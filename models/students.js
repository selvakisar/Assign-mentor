import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name:{
        type:String,required:true,
    },
    rollno:{
        type:String,required:true,unique:true,
    },
    batch:{
        type:String,required:true,
    },
    mentor:{
        type:mongoose.Schema.Types.ObjectId,ref:"Mentor",
    },
   
})
const Student =mongoose.model('Student',studentSchema)
export{Student}