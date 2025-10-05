import RedditCommumity from "../models/RedditCommunity";
import RedditUser from "../models/RedditUser";
import { asyncHandler } from "../utils/asyncHander";
import { sendMessage } from "../utils/sendMessage";
import { manager } from "../..";
export const getMyCommunities = asyncHandler(async(req,res)=>{
    const User = req.user;
    if(!User){
        return sendMessage(res,200,false,{
            data:"Cant find User"
        });
    }
    const allComm = await RedditCommumity.find({members:User._id});
    return sendMessage(res,200,true,{
        data:allComm
    });
});
export const getAllCommunities = asyncHandler(async(req,res)=>{
    const allComm = await RedditCommumity.find();
    return sendMessage(res,200,true,{
        data:allComm
    });
});
export const createOne = asyncHandler(async(req,res)=>{
    const {name,info,communityType} = req.body;
    const exist = await RedditCommumity.find({name});
    if(exist && exist.length > 0){
        return sendMessage(res,200,false,{
            data:"Community Already Exist"
        });
    }
    const Comm = await RedditCommumity.create({
        name,info,isPrivate: communityType === 'private',members:[req.user._id],founder:req.user._id
    });

        const msg = {
            type:"NEW_COMMUNITY",
            payload:{
                data:Comm
            }
        }
        // Broadcast to all connected users instead of specific community
        manager.broadCast('NATHI_KOI_GROUP',JSON.stringify(msg));
    return sendMessage(res,200,true,{
        data:Comm,
        info:"Successfully Created"
    }); 
});
export const deleteOne = asyncHandler(async(req,res)=>{
    const {commId} = req.body;
    const data = await RedditCommumity.findById(commId);
    if(!data){
        return sendMessage(res,404,false,{
            data:null,
            info:"Community not found"
        })
    }
    if(data.founder.toString() !== req.user._id.toString()){
        return sendMessage(res,200,false,{
            data:null,
            info:"There Was an Error"
        })
    }
    //Not Only Community but the post of that community and their comments also need to be deleted fix that here
    const del = await RedditCommumity.findByIdAndDelete(commId);
    //Get ALl posts related to del
    //Gel all comments related to posts
    return sendMessage(res,200,true,{
        data:del,
        info:"It was deleted"
    });
});
export const getOneCommumity = asyncHandler(async(req,res)=>{
    const {commId} = req.body;
    const data = await RedditCommumity.findById(commId);
    if(!data){
        return sendMessage(res,200,false,{
            data:null,
            info:"There was no Group named this"
        })
    }
    return sendMessage(res,200,true,{
        data:data,
        info:"Found One"
    });
});

export const joinOne = asyncHandler(async(req,res)=>{
    const {commId} = req.body;
    const userId = req.user._id;
    const data = await RedditCommumity.findById(commId);
    if(!data){
        return sendMessage(res,200,false,{
            data:null,
            info:"There was no Group named this"
        })
    }
    if(data.isPrivate){
        const alreadyRequested = data.request.find(e => e.toString() === userId.toString());
        const alreadyMember = data.members.find(e => e.toString() === userId.toString());
        if(alreadyMember){
            return sendMessage(res,200,false,{ data:null, info:"You are already in the Group" });
        }
        if(alreadyRequested){
            return sendMessage(res,200,true,{ data:null, info:"Request already sent" });
        }
        data.request.push(userId);
        await data.save();
        return sendMessage(res,200,true,{ data:null, info:"Request sent to admins" });
    }
    const flag = data.members.find(e => e.toString() === userId.toString());
    if(flag){
        return sendMessage(res,200,false,{
            data:null,
            info:"You are already in the Group"
        });
    }
    data.members.push(userId);
    await data.save();
    return sendMessage(res,200,true,{
        data:null,
        info:"Joined"
    });
});

export const leaveOne = asyncHandler(async(req,res)=>{
    const {commId} = req.body;
    const userId = req.user._id;
    const data = await RedditCommumity.findById(commId);
    if(!data){
        return sendMessage(res,404,false,{
            data:null,
            info:"Community not found"
        })
    }
    if(data.founder.toString() === userId.toString()){
        return sendMessage(res,400,false,{
            data:null,
            info:"Founder cannot leave the community"
        })
    }
    const isMember = data.members.find(e => e.toString() === userId.toString());
    if(!isMember){
        return sendMessage(res,400,false,{
            data:null,
            info:"You are not a member of this community"
        })
    }
    data.members = data.members.filter(e => e.toString() !== userId.toString());
    await data.save();
    return sendMessage(res,200,true,{
        data:null,
        info:"Left community successfully"
    });
});

//We have to make sure that only the admin is able to see this and Approve it
export const approveUser = asyncHandler(async(req,res)=>{
   //Save User in USer manager and when joined notify that user if user is live
    const {memberId,commId} = req.body;
    const adminId = req.user._id;
    const Comm = await RedditCommumity.findById(commId);
    if(!Comm){
        return sendMessage(res,404,false,{
            data:null,
            info:"Community not found"
        })
    }
    if(Comm.founder.toString() !== adminId.toString()){
        return sendMessage(res,200,false,{
            data:null,
            info:"Error"
        })
    }
    const flag1 = Comm.request.find(e => e.toString() === memberId.toString());
    Comm.request = Comm.request.filter(e => e.toString() !== memberId.toString());
    const flag2 = Comm.members.find(e => e.toString() === memberId.toString());
    if(!flag2){
        Comm.members.push(memberId);
    }
    await Comm.save()
    const user = await RedditUser.findById(memberId);
    const data = {
        type:"NEW_USER_JOINED",
        payload:{
            data:user
        }
    }
    manager.broadCast(Comm._id.toString(),JSON.stringify(data));
    return sendMessage(res,200,true,{
        data:"",
        info:"Success"
    })
});

export const getPendingRequests = asyncHandler(async(req,res)=>{
    const { commId } = req.body;
    const adminId = req.user._id;
    const Comm = await RedditCommumity.findById(commId).populate('request');
    if(!Comm){
        return sendMessage(res,404,false,{ data:null, info:"Community not found" });
    }
    if(Comm.founder.toString() !== adminId.toString()){
        return sendMessage(res,200,false,{ data:null, info:"Error" });
    }
    return sendMessage(res,200,true,{ data: Comm.request });
});

// DEMO ONLY: Delete all communities (no auth) for testing purposes
export const demoDeleteAllCommunities = asyncHandler(async(req,res)=>{
    const result = await RedditCommumity.deleteMany({});
    return sendMessage(res,200,true,{
        data:result,
        info:"All communities deleted (DEMO)."
    })
});