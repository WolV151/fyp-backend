import jwt, { JsonWebTokenError, JwtPayload, VerifyErrors } from 'jsonwebtoken';
import dotenv from 'dotenv';
import express, { Router, Response } from "express";
import { ICustomRequest } from '../interface/ICustomRequest';

export const verifyJWT = (req:ICustomRequest, res:Response, next:() => void) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        res.send(401).end();

    console.log(authHeader);
    const token = authHeader?.split(' ')[1];

    try{
        const decoded: JwtPayload = jwt.verify(token!, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
        req.user = decoded.username;
    } catch (e: unknown) {
        console.error(e);
        return res.send(401).end();
    }

    next();
}