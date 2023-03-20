import { User } from "../model/user";
import { Device } from "../model/device"
import express, { Router, Request, Response } from "express";
import { Document } from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt"
import { verifyJWT } from "../middleware/jwt"

const jsonParser = bodyParser.json();

export class UserRoute {
    public router: Router = express.Router();
    public path: string = "/user"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path, verifyJWT, this.getAllUsers);
        this.router.post(this.path, jsonParser, this.createNewUser);
        this.router.delete(this.path + "/:id", this.deleteUser);
    }

    public getAllUsers = async (req: Request, res: Response) => {
        const userDoc: Document[] = await User.find({}, { _id: 0 });
        res.json(userDoc);
    }

    public createNewUser = async (req: Request, res: Response) => {
        const newUser: Document = new User({
            username: req.body.username!,
            password: await bcrypt.hash(req.body.password!, 10),
            role: req.body.role!,
            token: ''
        });

        newUser.save((err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal error when saving new user");
                res.end()
            }
            else
                res.status(200)
            res.end()
        })
    }


    public deleteUser = (req: Request, res: Response) => {
        User.findOneAndDelete({ username: req.params.id }, (err: Error) => {
            if (err) {
                console.log(err);
                res.status(500).send("Internal error when deleting the device");
            }
            else
                res.status(200);
            res.end();
        })
    }

    // TODO: EDIT USER... or maybe not, perhaps just update password
}