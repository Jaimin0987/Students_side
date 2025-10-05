import { asyncHandler } from "../utils/asyncHander";
import { getResponse } from "../utils/giveResponse";
import { sendMessage } from "../utils/sendMessage";

export const haloRespond = asyncHandler(async(req,res)=>{
    const {request} = req.body;
    const userId = req.user?._id || "Nothing";
    const answer = await getResponse(request, userId);
    return sendMessage(res,201,true,{
        data:answer,
        info:null
    });
});