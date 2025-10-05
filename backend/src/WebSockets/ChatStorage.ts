import {WebSocket} from "ws";
/* 
    Make A Random Id Every Time Two User want to have chat
    ID can only be generted if and only if both users are active
    otherwise only simple REST is done
*/

export class ChatUserManager{
    private static instance: ChatUserManager;
    private activeUsers: Map<string, WebSocket>;
    private constructor() {
        this.activeUsers = new Map<string, WebSocket>();
    }
    public static getInstance(): ChatUserManager {
        if (!ChatUserManager.instance) {
            ChatUserManager.instance = new ChatUserManager();
        }
        return ChatUserManager.instance;
    }
    public addUser(userId: string, ws: WebSocket): void {
        this.activeUsers.set(userId, ws);
    }
    public removeUser(userId: string): void {
        this.activeUsers.delete(userId);
    }
    public isUserActive(userId: string): boolean {
        return this.activeUsers.has(userId);
    }
    public sendMessageToUser(userId:string,receiverId:string,message:string):boolean{
        const sender = this.activeUsers.get(userId);
        const receiver = this.activeUsers.get(receiverId);
        if(sender && receiver){
            const payload = JSON.stringify({type:'NEW_CHAT',from:userId,message:message});
            receiver.send(payload);
            return true;
        }
        return false;
    }
}