import RedditChatGroup, { IChatGroup } from "../models/RedditChatGroup";
import RedditChats, { IChat } from "../models/RedditChats";
import { asyncHandler } from "../utils/asyncHander";
import { sendMessage } from "../utils/sendMessage";
import { ChatUserManager } from "../../WebSockets/ChatStorage";
export const createChat = asyncHandler(async(req,res)=>{
    const senderId = req.user._id;
    const {receiverId,message} = req.body;
    
    // THree Steps
    // Chat Create
    // Fetch The Group if exist and add Chat Id There
    // Save it
    const chat = await RedditChats.create({
        senderId,receiverId,message
    });
    const grp = [senderId,receiverId].sort();
    let group = await RedditChatGroup.find({members:grp});
    let finalGrp;
    if(!group || group.length  == 0){
        finalGrp = await RedditChatGroup.create({
            members:grp
        });
    }else{
        finalGrp = group[0];
    }
    finalGrp.chats.push(chat._id);
    await finalGrp.save();
    const chatManager = ChatUserManager.getInstance();
    const user1Exist = chatManager.isUserActive(senderId);
    const user2Exist = chatManager.isUserActive(receiverId);
    // If Both Users are Active Send Message Through WebSocket
    if(user1Exist && user2Exist)
    chatManager.sendMessageToUser(senderId, receiverId, message);
    return sendMessage(res,201,true,{
        data:chat,
        info:"Chat Added"
    });
});


export const deleteChat = asyncHandler(async(req,res)=>{
    const {chatId} = req.params;
    const chat = await RedditChats.findOneAndUpdate({_id:chatId,senderId:req.user._id},{ hidden:true },{ new:true });
    if(!chat){
        return sendMessage(res,400,false,{
            data:null,
            info:"Cant Find Chat"
        })
    }
    return sendMessage(res,200,true,{
        data:chat,
        info:"Chat Deleted"
    })    
});

export const getChats = asyncHandler(async(req,res)=>{
    const {receiverId} = req.params;
    const senderId = req.user._id;
    const grp = [senderId,receiverId].sort();
    const group = await RedditChatGroup
        .findOne({members:grp})
        .populate({ path:'chats', options:{ sort:{ createdAt:1 } } })
        .lean();
    if(!group){
        return sendMessage(res,200,true,{ data:{ members:grp, chats:[] } });
    }
    const filtered = Array.isArray(group.chats) ? (group.chats as any).filter((e:any) => e && e.hidden === false) : [];
    return sendMessage(res,200,true,{
        data:{ ...group, chats: filtered },
    })
});