import express from "express";
import { getChats,createChat,deleteChat } from "../controllers/RedditMessageController";
import { AuthMiddlware } from "../utils/auth";
const chatRouter = express.Router();

chatRouter.get("/:receiverId",AuthMiddlware,getChats);
chatRouter.post("/create",AuthMiddlware,createChat);
chatRouter.delete("/:chatId",AuthMiddlware,deleteChat);
export default chatRouter;