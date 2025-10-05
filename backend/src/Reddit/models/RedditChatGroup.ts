import mongoose from "mongoose";
export interface IChatGroup{
    _id:mongoose.Types.ObjectId,
    createdAt:Date,
    updatedAt:Date,
    members:mongoose.Types.ObjectId[],
    chats:mongoose.Types.ObjectId[],
}

const schma = new mongoose.Schema({
    members:{
        type:[mongoose.Schema.Types.ObjectId],
        unique:true,
        required:true
    },
    chats:{
        type:[mongoose.Schema.Types.ObjectId],
        default:[],
        ref:'RedditChat'
    }
},{
    timestamps:true
});

const RedditChatGroup = mongoose.model('RedditChatGroup',schma);
export default RedditChatGroup;