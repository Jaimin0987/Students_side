import RedditComment from "../models/RedditComment";
import { sendMessage } from "../utils/sendMessage";
import { asyncHandler } from "../utils/asyncHander";
import RedditPosts from "../models/RedditPosts";
import { Analyze } from "../utils/moderatorFilter";
import { manager } from "../..";
export const getComments = asyncHandler(async(req,res)=>{
    const {postId,commentId} = req.params;
    let data;
    if(commentId === "NONE"){
        data = await RedditComment.find({post:postId,parentCommentId:null}).populate('owner');
    }else{
        data = await RedditComment.find({post:postId,parentCommentId:commentId}).populate('owner')    
    }
    return sendMessage(res,201,true,{
        data,
        info:"Data"
    });
});

export const postComments = asyncHandler(async(req,res)=>{
    const {message,imgUrl,postId,parentCommentId} = req.body;
    if(!message || !postId){
        return sendMessage(res,500,false,{
            data:"All fields Are required"
        });
    }
    
    const Post = await RedditPosts.findById(postId);
    if(!Post){
        return sendMessage(res,404,false,{
            data:null,
            info:"Post not found"
        });
    }
    
    const post = {
        title:Post.title || "",
        description:Post.description || ""
    };    
    const response = await Analyze(message,post,true);
    if(!response.isAppropriate){
    return sendMessage(res,201,true,{
        data:response,
        info:"Violating Our Terms and Condition"        
    });    
    }
    //Image Upload If Any
    const comment = await RedditComment.create({
        message,imgUrl,post:postId,
        parentCommentId:(parentCommentId !== null)?parentCommentId:null,
        owner:req.user._id
    });
    const msg = {
        type:"NEW_COMMENT",
        payload:{
            data:comment
        }
    }
    if(Post.group)
            manager.broadCast(Post.group.toString(),JSON.stringify(msg));
            else
            manager.broadCast('NATHI_KOI_GROUP',JSON.stringify(msg));
    return sendMessage(res,201,true,{
        data:comment,
        info:null        
    });
});

export const likeComment = asyncHandler(async(req,res)=>{
    const {id} = req.body;
    const userId = req.user._id;
    const comment = await RedditComment.findById(id);
    if(!comment){
        return sendMessage(res,404,false,{
            data:null,info:"Comment not found"
        });
    }
    const flag = comment.likes.find(e => e.toString() === userId.toString());
    const flag2 = comment.dislikes.find(e => e.toString() === userId.toString());
    if(!flag){
        comment.likes.push(userId);
        if(flag2){
            comment.dislikes = comment.dislikes.filter(e => e.toString() !== userId.toString());
        }
        await comment.save();
        
    }
    const msg = {
        type:"LIKED_COMMENT",
        payload:{
            data:comment
        }
    }
    return sendMessage(res,200,true,{
        data:null,info:"Liked"
    });
});

export const dislikeComment = asyncHandler(async(req,res)=>{
    const {id} = req.body;
    const userId = req.user._id;
    const comment = await RedditComment.findById(id);
    if(!comment){
        return sendMessage(res,404,false,{
            data:null,info:"Comment not found"
        });
    }
    const flag = comment.likes.find(e => e.toString() === userId.toString());
    const flag2 = comment.dislikes.find(e => e.toString() === userId.toString());
    if(!flag2){
        comment.dislikes.push(userId);
        if(flag){
            comment.likes = comment.likes.filter(e => e.toString() !== userId.toString());
        }
        await comment.save();
    }
    
    const msg = {
        type:"DISLIKED_COMMENT",
        payload:{
            data:comment
        }
    }
    return sendMessage(res,200,true,{
        data:null,info:"Disliked"
    });
});
export const deleteComment = asyncHandler(async(req,res)=>{
    const {id} = req.body;
    const userId = req.user._id;
    const data = await RedditComment.findOneAndDelete({ _id: id, owner:userId });
    if(!data){
        return sendMessage(res,404,false,{
            data:null,info:"Invalid Operation"
        })
    }
    return sendMessage(res,200,true,{
            data,info:"Deleted"
        }) 
});