import express, { Router, Request, Response } from "express";
import { User } from "../model/user";
import bodyParser from "body-parser";
import { Document, Query } from "mongoose";
import { IUser } from "../interface/IUser";
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"

const jsonParser = bodyParser.json();
dotenv.config()



export class RefreshRoute {
    public router: Router = express.Router();
    public path: string = "/refresh"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path, this.handleRefresh);
    }

    public handleRefresh = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        let foundUserObj: IUser = { username: "", password: "", role: -1, token: "" };
        console.log(cookies.jwt)
        if (!cookies?.jwt)
            return res.status(401).end();

        console.log(cookies.jwt)
        const refreshToken = cookies.jwt;
        const foundUser: Document = await User.findOne({ token: refreshToken }) as Document;

        if (!foundUser)
            return res.status(403).end();
        else
            foundUserObj = foundUser.toJSON();


        const decoded: JwtPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;

        if (foundUserObj.username !== decoded.username)
            res.send(403).end();


        const accessToken = jwt.sign(
            { "username": foundUserObj.username },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '5m' }
        );
        res.json ({accessToken});
    }




}