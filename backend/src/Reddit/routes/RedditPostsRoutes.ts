import express from "express";
import { getTrendingPosts,getAllPosts,getMyPosts,createPost,deletePost,demoDeleteAllPosts,likePost,dislikePost } from "../controllers/RedditPostsController";
import { AuthMiddlware } from "../utils/auth";
import { upload } from "../utils/multerStorage";

const postRouter = express.Router();

postRouter.post('/create',AuthMiddlware,upload.single('image'),createPost);
postRouter.post('/',AuthMiddlware,getAllPosts);
postRouter.post('/my',AuthMiddlware,getMyPosts);
postRouter.post('/trending',AuthMiddlware,getTrendingPosts);
postRouter.post('/like',AuthMiddlware,likePost);
postRouter.post('/dislike',AuthMiddlware,dislikePost);
postRouter.delete('/delete',AuthMiddlware,deletePost);
postRouter.delete('/demo/deleteAll',demoDeleteAllPosts);

export default postRouter;