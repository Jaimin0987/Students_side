import { Response } from "express";

export function sendMessage(res: Response, statusCode: number, status: boolean, payload: any) {
    return res.status(statusCode).json({
        status,
        payload
    });
}