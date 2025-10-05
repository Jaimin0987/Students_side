import express from "express";
import { createOne,getOneCommumity,getAllCommunities,getMyCommunities,deleteOne,joinOne,leaveOne,approveUser,getPendingRequests,demoDeleteAllCommunities } from "../controllers/RedditCommunityController";
import { AuthMiddlware } from "../utils/auth";
const commRouter = express.Router();

commRouter.post('/create',AuthMiddlware,createOne);
commRouter.post('/getOne',AuthMiddlware,getOneCommumity);
commRouter.post('/',AuthMiddlware,getAllCommunities);
commRouter.post('/my',AuthMiddlware,getMyCommunities);
commRouter.post('/join',AuthMiddlware,joinOne);
commRouter.post('/leave',AuthMiddlware,leaveOne);
commRouter.post('/approve',AuthMiddlware,approveUser);
commRouter.post('/requests',AuthMiddlware,getPendingRequests);
commRouter.delete('/',AuthMiddlware,deleteOne);
// DEMO ONLY - do not protect
commRouter.delete('/demo/deleteAll',demoDeleteAllCommunities);
export default commRouter;