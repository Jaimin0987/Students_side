import mongoose from "mongoose";

interface ICommnet{
    _id:mongoose.Types.ObjectId,
    message:string,
    likes:mongoose.Types.ObjectId[],
    dislikes:mongoose.Types.ObjectId[],
    imgUrl?:string,
    parentCommentId:mongoose.Types.ObjectId | null,
    post:mongoose.Types.ObjectId,
    owner:mongoose.Types.ObjectId,
    createdAt:Date,
    updatedAt:Date
}

const CommnetSchema = new mongoose.Schema<ICommnet>({
    message:{
        type:String,
        required:true
    },
    likes:{
        type:[mongoose.Schema.Types.ObjectId],
        default:[]
    },
    dislikes:{
        type:[mongoose.Schema.Types.ObjectId],
        default:[]
    },
    imgUrl:{
        type:String,
        default:null
    },
    parentCommentId:{
        type:mongoose.Schema.Types.ObjectId,
        default:null,
        ref:'RedditComment'
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RedditPosts',
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RedditUser',
        required:true
    }
},{
    timestamps:true
});

const RedditComment = mongoose.model('RedditComment',CommnetSchema);
export default RedditComment;