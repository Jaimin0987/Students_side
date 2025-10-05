import RedditUser from "../models/RedditUser";
import { asyncHandler } from "../utils/asyncHander";
import bcrypt from "bcrypt";
import { sendMessage } from "../utils/sendMessage";
import jsonwebtoken from "jsonwebtoken";
export const registerUser = asyncHandler(async(req,res)=>{
    const {name,email,password,uniqueId} = req.body;
    const exist = await RedditUser.find({email});
    if(exist && exist.length > 0){
        return sendMessage(res,200,false,{
            data:null,info:"User Exist"
        })
    }
    const pass = await bcrypt.hash(password,10);
    const avatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(uniqueId || email || name)}&backgroundColor=ffdfbf,ffd5dc,ebf4ff`;
    const Reg = await RedditUser.create({
        name,email,password:pass,uniqueId,avatar
    });
    return sendMessage(res,200,true,{
        data:Reg,
        info:null
    });
});
export const loginUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    const exist = await RedditUser.find({email});
    if(!exist || exist.length == 0){
        return sendMessage(res,200,false,{
            data:null,info:"User Does Not Exist"
        })
    }
    const flag = await bcrypt.compare(password,exist[0].password);
    if(!flag){
        return sendMessage(res,200,false,{
            data:null,info:"Error"
        })
    }
    const token = await jsonwebtoken.sign({ _id: exist[0]._id },"SECRET");
    return sendMessage(res,200,true,{
        data:null,
        token
    });
});
export const getUserDetails = asyncHandler(async(req,res)=>{
    const {_id}  = req.user;
    const user = await RedditUser.findById(_id);
    return sendMessage(res,200,true,{
        data:user
    })
});

export const getAllUsers = asyncHandler(async(req,res)=>{
    const users = await RedditUser.find({}, { password: 0 }).lean();
    return sendMessage(res,200,true,{
        data:users
    });
});

// DEMO ONLY: Delete all users (no auth) for testing purposes
export const demoDeleteAllUsers = asyncHandler(async(req,res)=>{
    const result = await RedditUser.deleteMany({});
    return sendMessage(res,200,true,{
        data:result,
        info:"All users deleted (DEMO)."
    })
});