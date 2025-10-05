import mongoose from "mongoose";

interface IRedditUser{
    _id:mongoose.Types.ObjectId,
    email:string,
    password:string,
    avatar:string,
    createdAt:Date,
    updatedAt:Date,
    uniqueId:string,
    name:string
}
const RedditUserSchema = new mongoose.Schema<IRedditUser>({
    email:{
        type:String,required:true,unique:true
    },
    password:{
        type:String,required:true
    },
    avatar:{
        type:String
    },
    uniqueId:{
        type:String,required:true,unique:true
    },
    name:{
        type:String,required:true
    },
},{
    timestamps:true
});
const RedditUser = mongoose.model('RedditUser',RedditUserSchema);
export default RedditUser;