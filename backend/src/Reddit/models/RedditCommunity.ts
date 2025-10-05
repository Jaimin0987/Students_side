import mongoose from "mongoose";

interface ICommu {
    _id:mongoose.Types.ObjectId,
    name:string,
    info?:string,
    isPrivate:boolean,
    members:mongoose.Types.ObjectId[],
    founder:mongoose.Types.ObjectId,
    request:mongoose.Types.ObjectId[], 
    createdAt:Date,
    updatedAt:Date
};

const CommuSchema = new mongoose.Schema<ICommu>({
    name:{
        type:String,required:true,unique:true
    },
    info:{
        type:String
    },
    isPrivate:{
        type:Boolean,
        default:false
    },
    members:{
        type:[mongoose.Schema.Types.ObjectId],
        default:[],
        ref:'RedditUser'
    },
    request:{
        type:[mongoose.Schema.Types.ObjectId],
        default:[],
        ref:'RedditUser'
    },
    founder:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'RedditUser'
    },
},{
    timestamps:true
})

const RedditCommumity = mongoose.model('RedditCommunity',CommuSchema);
export default RedditCommumity;