import RedditPosts from "../models/RedditPosts";
import RedditCommumity from "../models/RedditCommunity";
import { asyncHandler } from "../utils/asyncHander";
import { Analyze } from "../utils/moderatorFilter";
import { sendMessage } from "../utils/sendMessage";
import cloudinary from "../utils/coudinary";
import { upload } from "../utils/multerStorage";
import fs from "fs";
import { manager } from "../..";
export const getAllPosts = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;
    // Find allowed communities: all public + ones the user is a member of
    const [publicComms, myComms] = await Promise.all([
        RedditCommumity.find({ isPrivate: false }).select('_id').lean(),
        userId ? RedditCommumity.find({ members: userId }).select('_id').lean() : Promise.resolve([] as any)
    ]);
    const allowedIds = new Set([...(publicComms || []).map(c => String(c._id)), ...(myComms || []).map(c => String(c._id))]);
    const all = await RedditPosts.find({ $or: [ { group: null }, { group: { $in: Array.from(allowedIds) } } ] });
    return sendMessage(res,200,true,{
        data:all,
        info:null
    });
});

/**
 * Here We have to make sure it has Rate limiting in the front
 * @param all has to be send 10 or 5 per request by user
 */

export const getTrendingPosts = asyncHandler(async(req,res)=>{
    let all = await RedditPosts.find();
    all = all.sort((a,b) => b.likes.length - a.likes.length);
    //Make Some Offset Here
    return sendMessage(res,200,true,{
        data:all,
        info:null
    })
});
export const getMyPosts = asyncHandler(async(req,res)=>{
    const all = await RedditPosts.find({owner:req.user._id});
    //Sorting Here By Likes or Do it in front end
    return sendMessage(res,200,true,{
        data:all,
        info:null
    })
});
export const getCommunitiesPost = asyncHandler(async(req,res)=>{
    const {commId} = req.body;
    const userId = req.user._id;
    const comm = await RedditCommumity.findById(commId);
    if(!comm){
        return sendMessage(res,404,false,{ data:null, info:"Community not found" });
    }
    if(comm.isPrivate && String(comm.founder) !== String(userId) && !comm.members.find(e => String(e) === String(userId))){
        return sendMessage(res,403,false,{ data:[], info:"Private community" });
    }
    const all = await RedditPosts.find({group:commId});
    return sendMessage(res,200,true,{
        data:all,info:null
    });
})

export const deletePost = asyncHandler(async(req,res)=>{
    const {postId} = req.body;
    const userId = req.user._id;
    const post = await RedditPosts.findById(postId);
    if(!post){
        return sendMessage(res,404,false,{
            data:null,info:"Post not found"
        })
    }
    if(post.owner.toString() !== userId.toString()){
        return sendMessage(res,200,false,{
            data:null,info:"Unauthorized User"
        })      
    }
    await RedditPosts.findByIdAndDelete(postId);
    return sendMessage(res,200,true,{
        data:null,info:"Deleted"
    })    
});
export const createPost = asyncHandler(async(req,res)=>{
    const {title,description} = req.body;
    const grp = (req.body.group === '' || req.body.group === undefined) ? null : req.body.group;
    
    // Check if user is trying to post in a community
    let members;
    if (grp) {
        const community = await RedditCommumity.findById(grp);
        if (!community) {
            return sendMessage(res, 404, false, {
                data: null,
                info: "Community not found"
            });
        }
        
        // Check if user is founder or member of the community
        const isFounder = community.founder.toString() === req.user._id.toString();
        const isMember = community.members.find(e => e.toString() === req.user._id.toString());
        
        if (!isFounder && !isMember) {
            return sendMessage(res, 403, false, {
                data: null,
                info: "You must be a member of this community to post here"
            });
        }
        members = community.members;
    }
    
    // Run moderation, but do not block creation
    const moderationInput = { title, description };
    const data = await Analyze("",moderationInput,false);
    console.log(data);
    if(data.isAppropriate == false){
        res.json({
            type:"Error",
            payload:"Error"
        })
        return;
    }    
    let imgUrl = null;
    if (req.file) {
        try {
            const filePath = req.file.path;
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
                folder: "temp"
            });
            imgUrl = result.secure_url;
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error('Error uploading to cloudinary:', error);
            // Continue without image if upload fails
        }
    }
    
    const Post = await RedditPosts.create({
        title,description,imgUrl,group:grp,owner:req.user._id
    });
        const msg = {
            type:"NEW_POST",
            payload:{
                data:Post,
                members
            }
        }
        console.log(Post);
        if(Post.group)
        manager.broadCast(Post.group.toString(),JSON.stringify(msg));
        else
        manager.broadCast('NATHI_KOI_GROUP',JSON.stringify(msg));
    return sendMessage(res,200,true,{
        data:Post,
        info:(data && data.reason) ? `Created (moderation: ${data.reason})` : "Created"
    });
});

// DEMO ONLY: Delete all posts (no auth) for testing purposes
export const demoDeleteAllPosts = asyncHandler(async(req,res)=>{
    const result = await RedditPosts.deleteMany({});
    return sendMessage(res,200,true,{
        data:result,
        info:"All posts deleted (DEMO)."
    })
});

export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const userId = req.user._id;
  
  const post = await RedditPosts.findById(postId);
  if (!post) {
    return sendMessage(res, 404, false, {
      data: null,
      info: "Post not found"
    });
  }

  const alreadyLiked = post.likes.find(e => e.toString() === userId.toString());
  const alreadyDisliked = post.dislikes.find(e => e.toString() === userId.toString());

  if (!alreadyLiked) {
    post.likes.push(userId);
    if (alreadyDisliked) {
      post.dislikes = post.dislikes.filter(e => e.toString() !== userId.toString());
    }
    await post.save();
  }

  // Broadcast like update via WebSocket
  const msg = {
    type: "POST_LIKED",
    payload: {
      postId: post._id,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userVote: 'up'
    }
  };
  
  if (post.group) {
    manager.broadCast(post.group.toString(), JSON.stringify(msg));
  } else {
    manager.broadCast('NATHI_KOI_GROUP', JSON.stringify(msg));
  }

  return sendMessage(res, 200, true, {
    data: {
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userVote: 'up'
    },
    info: "Post liked"
  });
});

export const dislikePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const userId = req.user._id;
  
  const post = await RedditPosts.findById(postId);
  if (!post) {
    return sendMessage(res, 404, false, {
      data: null,
      info: "Post not found"
    });
  }

  const alreadyLiked = post.likes.find(e => e.toString() === userId.toString());
  const alreadyDisliked = post.dislikes.find(e => e.toString() === userId.toString());

  if (!alreadyDisliked) {
    post.dislikes.push(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter(e => e.toString() !== userId.toString());
    }
    await post.save();
  }

  // Broadcast dislike update via WebSocket
  const msg = {
    type: "POST_DISLIKED",
    payload: {
      postId: post._id,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userVote: 'down'
    }
  };
  
  if (post.group) {
    manager.broadCast(post.group.toString(), JSON.stringify(msg));
  } else {
    manager.broadCast('NATHI_KOI_GROUP', JSON.stringify(msg));
  }

  return sendMessage(res, 200, true, {
    data: {
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userVote: 'down'
    },
    info: "Post disliked"
  });
});