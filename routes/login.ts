import express, { Router, Request, Response } from "express";
import { User } from "../model/user";
import bodyParser from "body-parser";
import { Document, Query } from "mongoose";
import { IUser } from "../interface/IUser";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

const jsonParser = bodyParser.json();
dotenv.config()



export class LoginRoute {
    public router: Router = express.Router();
    public path: string = "/login"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.post(this.path, jsonParser, this.handleLogin);
    }

    public handleLogin = async (req:Request, res:Response) => {
        const formUser = {
            username: req.body.username,
            password: req.body.password
        }

        let foundUserObj: IUser = {username: "", password: "", role: -1, token: ""};

        if (!formUser.username || !formUser.password)
            return res.status(400).end();

        const foundUser: Document | null = await User.findOne({username: formUser.username});

        if (!foundUser)
            return res.status(401).end();
        else
            foundUserObj = foundUser.toJSON();

        let checkPwd: boolean = false

        try{
            checkPwd = await bcrypt.compare(formUser.password, foundUserObj.password);
        } catch (e: unknown) {
            return res.status(401).end()
        }

        if (checkPwd){
            const accessToken = jwt.sign(
                {"username": foundUserObj.username},
                process.env.ACCESS_TOKEN_SECRET!,
                { expiresIn: '5m' }
            );

            const refreshToken = jwt.sign(
                {"username": foundUserObj.username},
                process.env.REFRESH_TOKEN_SECRET!,
                { expiresIn: '1d' }
            );

            const resUpdate = await User.updateOne({username: foundUserObj.username}, {token: refreshToken})

            res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24*60*60*1000, secure:true, sameSite:'none'});
            res.json({accessToken});
        } else {
            res.send(401).end()
        }


    }




}