import mongoose from "mongoose"
import WebSocket from "ws";
import { IChat } from "../Reddit/models/RedditChats";
export interface UserData{
    ws:WebSocket
    userId:string
}
//Group Data -> User WebSockets
export class UserManager{
    private users:Map<string,UserData[]>;
    constructor(){
        this.users = new Map<string,UserData[]>();
    }
    addUser(groupId:string,userId:string,ws:WebSocket){
        // First remove any existing entries for this user in this group
        this.removeUser(groupId, userId);
        
        let getGroup = this.users.get(groupId);
        if(!getGroup){
            getGroup = [];
            this.users.set(groupId, getGroup);
        }
        
        getGroup.push({
            ws,userId
        });
        
        console.log(`Added user ${userId} to group ${groupId}. Group now has ${getGroup.length} users.`);
    }
    exist(groupId:string,userId:string){
        const data = this.users.get(groupId);
        if(!data)return false;
        const user = data.find(e => e.userId === userId);
        if(!user)return false;
        return true;
    }
    removeUser(groupId:string,userId:string){
        if(!this.exist(groupId,userId)) return;
        const getGroup = this.users.get(groupId);
        if(getGroup){
            const filteredUsers = getGroup.filter(user => user.userId !== userId);
            if(filteredUsers.length === 0){
                this.users.delete(groupId);
            } else {
                this.users.set(groupId, filteredUsers);
            }
        }
    }
    broadCast(groupId:string,message:string){
        console.log(`Broadcasting to group: ${groupId}`);
        console.log(`Available groups:`, Array.from(this.users.keys()));
        
        if(groupId==='NATHI_KOI_GROUP'){
            console.log('Broadcasting to all users');
            this.all(message);
        }else{
            const userAll = this.users.get(groupId);
            if(!userAll){
                console.log(`No users found in group: ${groupId}`);
                return;
            }
            console.log(`Broadcasting to ${userAll.length} users in group: ${groupId}`);
            for(let user of userAll){
                try {
                    if(user.ws.readyState === 1) { // WebSocket.OPEN
                        user.ws.send(message);
                    } else {
                        console.log(`WebSocket not open for user: ${user.userId}`);
                    }
                } catch(error) {
                    console.error(`Error sending message to user ${user.userId}:`, error);
                }
            }
        }   
    }
    all(message:string){
        const members = Array.from(this.users.values()).flat();
        console.log(`Broadcasting to all: ${members.length} total users`);
        for(let user of members){
            try {
                if(user.ws.readyState === 1) { // WebSocket.OPEN
                    user.ws.send(message);
                } else {
                    console.log(`WebSocket not open for user: ${user.userId}`);
                }
            } catch(error) {
                console.error(`Error sending message to user ${user.userId}:`, error);
            }
        }
    }
    
    // Remove user from all groups by WebSocket connection
    removeUserByWebSocket(ws: WebSocket) {
        console.log('Removing user by WebSocket connection');
        let removedCount = 0;
        
        for (const [groupId, users] of this.users.entries()) {
            const initialLength = users.length;
            const filteredUsers = users.filter(user => user.ws !== ws);
            
            if (filteredUsers.length !== initialLength) {
                removedCount++;
                if (filteredUsers.length === 0) {
                    this.users.delete(groupId);
                    console.log(`Deleted empty group: ${groupId}`);
                } else {
                    this.users.set(groupId, filteredUsers);
                    console.log(`Removed user from group: ${groupId}`);
                }
            }
        }
        
        console.log(`Removed user from ${removedCount} groups`);
    }
    
    // Get total user count across all groups
    getTotalUsers(): number {
        return Array.from(this.users.values()).flat().length;
    }
    
    // Get user count for a specific group
    getGroupUserCount(groupId: string): number {
        const group = this.users.get(groupId);
        return group ? group.length : 0;
    }
}
