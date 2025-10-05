import { NextFunction } from "express";
export function asyncHandler(fun:(req:any,res:any,next:NextFunction) => Promise<any>){
    return async (req:any,res:any,next:NextFunction)=>{
        return Promise.resolve(fun(req,res,next)).catch(e => next(e));
    }
}