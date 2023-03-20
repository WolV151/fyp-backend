import express, { Router, Request, Response } from "express";
import { User } from "../model/user";
import bodyParser from "body-parser";
import { Document, Query } from "mongoose";
import { IUser } from "../interface/IUser";

const jsonParser = bodyParser.json();


export class LogoutRoute {
    public router: Router = express.Router();
    public path: string = "/logout"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path, this.handleLogout);
    }

    public handleLogout = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        let foundUserObj: IUser = { username: "", password: "", role: -1, token: "" };

        if (!cookies?.jwt)
            return res.status(204).end();

        const refreshToken = cookies.jwt;
        const foundUser: Document = await User.findOne({ token: refreshToken }) as Document;

        if (!foundUser) {
            res.clearCookie('jwt', {httpOnly:true, secure:true, maxAge: 24*60*60*1000})
            return res.status(204).end();
        }
        else
            foundUserObj = foundUser.toJSON();


        const resUpdate = await User.updateOne({username: foundUserObj.username}, {token: ""})
        res.clearCookie('jwt', {httpOnly:true, secure:true, maxAge: 24*60*60*1000})
        return res.status(204).end()
    }

}