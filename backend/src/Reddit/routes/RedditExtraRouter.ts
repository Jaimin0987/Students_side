import express from 'express';
import {
    joinAdminGroup,
    getGroupFiles,
    getGroupAssignments,
    submitAssignment
} from '../controllers/RedditExtraAdminController';
import { AuthMiddlware } from "../utils/auth";
import { upload } from "../utils/multerStorage";
import AdminGroup from '../models/AssGroups';
const rrouter = express.Router();

rrouter.use(AuthMiddlware);
rrouter.get('/groups',async (req,res)=>{
    try{
        const groups = await AdminGroup.find();
        res.json(groups);
    }catch(e){
        console.log(e);
        res.status(500).json({error:e});
    }
});

rrouter.post('/groups/:groupId/join', joinAdminGroup);

rrouter.get('/groups/:groupId/files', getGroupFiles);

rrouter.get('/groups/:groupId/assignments', getGroupAssignments);

rrouter.post('/assignments/:assignmentId/submit',upload.single('image'), submitAssignment);

export default rrouter;
