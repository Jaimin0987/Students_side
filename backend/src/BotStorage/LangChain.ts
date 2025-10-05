export interface Chat{
    message:string,
    senderType:"user"|"gemini"
}
export class LangChain{
    private chats:Map<string,Chat[]>;
    private static instance:LangChain;

    public static getInstance():LangChain{
        if(!LangChain.instance){
            LangChain.instance = new LangChain();
        }
        return LangChain.instance;
    }
        constructor(){
            this.chats = new Map();
        }   
    public addUser(userId:string){
        if(!this.chats.has(userId)){
            this.chats.set(userId,[]);
        }
    }
    public addChat(userId:string,chat:Chat){
        this.addUser(userId);
        this.chats.get(userId)?.push(chat);
    }
    public getChats(userId:string):Chat[]{
        this.addUser(userId);
        return this.chats.get(userId) || [];
    }
    public removeUser(userId:string){
        if(this.chats.has(userId)){
            this.chats.delete(userId);
        }
    }
}