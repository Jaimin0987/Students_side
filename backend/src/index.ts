require('dotenv').config();
import express from "express";
import cors from "cors";
import userRouter from "./Reddit/routes/RedditUserRoutes";
import commRouter from "./Reddit/routes/RedditCommunityRoutes";
import postRouter from "./Reddit/routes/RedditPostsRoutes";
import { connectDB } from "./Reddit/utils/connectDB";
import commentRouter from "./Reddit/routes/RedditCommentRoutes";
import chatRouter from "./Reddit/routes/RedditMessageRoute";
import rrouter from "./Reddit/routes/RedditExtraRouter";
import botRouter from "./Reddit/routes/RedditBotRoutes";
import { Analyze } from "./Reddit/utils/moderatorFilter";
import { getResponse } from "./Reddit/utils/giveResponse";
import { WebSocket,WebSocketServer } from "ws";
import { UserManager } from "./WebSockets/UserStorage";
import { ChatUserManager } from "./WebSockets/ChatStorage";
import { LangChain } from "./BotStorage/LangChain";
const app = express();
const PORT = process.env.PORT || 8000;
export const manager = new UserManager();

const chatManager = ChatUserManager.getInstance();
const chain = LangChain.getInstance();
app.use(cors({ 
    origin: ['http://localhost:5173'], 
    credentials: false,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/users',userRouter);
app.use('/posts',postRouter);
app.use('/community',commRouter);
app.use('/comments',commentRouter);
app.use('/chats',chatRouter);
app.use('/bot', botRouter);
app.use('/students',rrouter);
app.get('/',async (req,res)=>{
    // const post = {
    //     title:"India People",
    //     description:"They Are Very Intelligent"
    // };
    // const response = await Analyze("They have no civic sense",post,true);
    const text = "Hey What are you and can you help me to make an assay on Queen of Hillstation in india";
    const response = await getResponse(text,"Nothing");
    res.json({
        status:true,
        msg:response
    });
})
let wss:WebSocketServer;
async function startServer(){
    await connectDB();
    const server = app.listen(PORT,()=>console.log(`Running On ${PORT}`));
    
    wss = new WebSocketServer({server});
    wss.on('connection',(ws:WebSocket)=>{
        let flag = false;
        console.log('New WebSocket connection established');
        console.log(`Total active connections: ${wss.clients.size}`);
        
        // Send connection confirmation immediately (WebSocket is already open)
        const data = {
            type:"CONNECTED",
            payload:{
                data:null
            }
        }
        ws.send(JSON.stringify(data));
        flag = true;
        
        ws.on('message',(raw)=>{
            try {
                const t = raw.toString();
                const data = JSON.parse(t);
                console.log('Received WebSocket message:', data);
                const type = data.type;
                const payload = data.payload;
                
                switch(type){
                    case 'NEW_USER':
                        console.log(`Adding user ${payload.userId} to group ${payload.groupId}`);
                        manager.addUser(payload.groupId,payload.userId,ws);
                        console.log(`Total users in system: ${manager.getTotalUsers()}`);
                        chain.addUser(payload.userId);
                        break;
                    case 'REMOVE_USER':
                        console.log(`Removing user ${payload.userId} from group ${payload.groupId}`);
                        manager.removeUser(payload.groupId,payload.userId);
                        console.log(`Total users in system: ${manager.getTotalUsers()}`);
                    break;
                    case 'JOIN_CHAT':
                        console.log(`User ${payload.userId} joining chat`);
                        chatManager.addUser(payload.userId,ws);
                    break;
                    case 'LEAVE_CHAT':
                        console.log(`User ${payload.userId} leaving chat`);
                        chatManager.removeUser(payload.userId);
                    break;
                    case 'BOT_CHAT':
                        const response = getResponse(payload.message,payload.userId).then((res)=>{
                            const responseData = {
                                type:"BOT_CHAT",
                                payload:{
                                    userId:payload.userId,
                                    message:res.data
                                }
                            };
                            ws.send(JSON.stringify(responseData));
                        });
                    break;
                }
            } catch(error) {
                console.error('Error processing WebSocket message:', error);
            }
        });
        
        ws.on('pong',()=>{
            flag = true;
        })
        
        const interval = setInterval(()=>{
            if(!flag){
                console.log('WebSocket ping timeout - terminating connection');
                ws.terminate();
            }else{
                flag = false;
                ws.ping()
            }
        },20000);
        
        ws.on('close',(code, reason)=>{
            console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
            console.log(`Remaining active connections: ${wss.clients.size - 1}`);
            
            clearInterval(interval);
            
            // Remove user from all groups when connection closes
            manager.removeUserByWebSocket(ws);
            console.log(`Total users in system after cleanup: ${manager.getTotalUsers()}`);
        })
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            clearInterval(interval);
            manager.removeUserByWebSocket(ws);
        });
    });
}
startServer();