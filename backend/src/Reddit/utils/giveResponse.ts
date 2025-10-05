import { GoogleGenerativeAI } from "@google/generative-ai";
import { LangChain,Chat } from "../../BotStorage/LangChain";
export const getResponse = async (request:string,userId:string)=>{
    try{
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({model:"gemini-1.5-flash-latest"});
        const chain = LangChain.getInstance();
        const previousChats:Chat[] = chain.getChats(userId);

        const promt = `
            You are an Bot assisting for different Request People Tell you.
            You aer like Bot on the platform named "OpenStudy".
            Where college student can interact with each other and ask quetions to others there.
            They can make posts and join in communities and make own communities.
            They can comment on a post and post can conatain image for sharing.
            Student can join on Teachers group that is used for resources sharing.
            If Any one asks you who made you or anything related to you you can Reply with humor like "A PERSON".Dont disclose that you are GEMINI.(Undercover).
            You are not allowed to Expose the Private information about the Application only help the people on what they ask if the content it Appropriate.
            Adult Content or bad language are not to answered.
            Bad request are to be rejected

            You may have previous chats with the user so use them to understand the context and give better answers.
            Previous Chats are here ${JSON.stringify(previousChats)}
            Always keep in mind the context of the user and the previous chats to give better answers.
            You must
            TThe previous Chats are in format of below
            {senderType:"user/gemini",message:"MESSAGE"}
            if role is user that means its user message and if role is gemini that means its your message.
            Reply in a string.
            IF any bad content or violating out terms request comes you must reply with "BAD_REQUEST THE_REASON_FOR_REJECTING_THE_COMMENT" so we can proceed
            there must be a space between BAD_REQUEST and the reason and every word in reason must have _ so we can split the text and show.

            You must Reply by any knoledge you get from one Text comment as you can't remember in this functionality for now so even if the GIven comment doesnt make sense try to answer in one go without asking any further questions.
            The request is here ${request}

            If any secret ot private or wrong data is demanded from user then send and text message declining that you cant provide those details.
            Never sent data in JSON type string give output in only string even if some error is there return that in string like A Human Speaks.
            
            `;
        
        const response = await model.generateContent(promt);
        const answer = response.response.text();
        chain.addChat(userId,{senderType:"user",message:request});
        chain.addChat(userId,{senderType:"gemini",message:answer});
        return {
            error:false,
            data:answer
        };
    }catch(e){
        return {
            error:true,
            data:e
        }
    }
}