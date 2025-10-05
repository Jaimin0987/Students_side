import express from "express";
import { registerUser,loginUser,getUserDetails,getAllUsers,demoDeleteAllUsers } from "../controllers/RedditUserController";
import { AuthMiddlware } from "../utils/auth";
const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.get('/me',AuthMiddlware,getUserDetails);
userRouter.get('/all',AuthMiddlware,getAllUsers);
// DEMO ONLY - do not protect
userRouter.delete('/demo/deleteAll',demoDeleteAllUsers);
export default userRouter;