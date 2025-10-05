//Here we just have to make chat logic for 2 persons only no group Chats

import mongoose from "mongoose";

export interface IChat{
    _id:mongoose.Types.ObjectId,
    createdAt:Date,
    updatedAt:Date,
    senderId:mongoose.Types.ObjectId,
    receiverId:mongoose.Types.ObjectId,
    message:string,
    hidden:boolean
}

const chatSchema = new mongoose.Schema<IChat>({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'RedditUser'
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'RedditUser'
    },
    message:{
        type:String,
        required:true
    },
    hidden:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

const RedditChats = mongoose.model('RedditChat',chatSchema);
export default RedditChats;