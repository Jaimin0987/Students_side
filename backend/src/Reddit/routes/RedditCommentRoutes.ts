import express from "express";
import { AuthMiddlware } from "../utils/auth";
import { likeComment,dislikeComment,getComments,postComments,deleteComment } from "../controllers/RedditCommentController";

const commentRouter = express.Router();

commentRouter.get('/:postId/:commentId',AuthMiddlware,getComments);
commentRouter.post('/like',AuthMiddlware,likeComment);
commentRouter.post('/dislike',AuthMiddlware,dislikeComment);
commentRouter.post('/create',AuthMiddlware,postComments);
commentRouter.delete('/',AuthMiddlware,deleteComment);

export default commentRouter;