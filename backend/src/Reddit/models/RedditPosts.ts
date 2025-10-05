import mongoose from "mongoose";

interface IRedditPostsSchema{
    _id:mongoose.Types.ObjectId,
    title:string,
    description:string,
    imgUrl?:string
    likes?:mongoose.Types.ObjectId[],
    dislikes?:mongoose.Types.ObjectId[],
    owner:mongoose.Types.ObjectId,
    group?:mongoose.Types.ObjectId,
    createdAt:Date,
    updatedAt:Date
};

const RedditPostsSchema = new mongoose.Schema<IRedditPostsSchema>({
    title:{
        type:String,required:true
    },
    description:{
        type:String,required:true
    },
    imgUrl:{
        type:String
    },
    likes:{
        type:[mongoose.Schema.Types.ObjectId],
        default:[],
        ref:"RedditUser"
    },
    dislikes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"RedditUser",
        default:[]
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RedditUser",
        required:true
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RedditCommunity",
        default:null
    }
},{
    timestamps:true
});

const RedditPosts = mongoose.model('RedditPosts',RedditPostsSchema);
export default RedditPosts;