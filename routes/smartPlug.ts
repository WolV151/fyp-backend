import { SmartPlug } from "../model/smartPlug";
import express, { Router, Request, Response } from "express";
import { Document } from "mongoose";

export const smartPlugList: string[] = []

// const populateArray = async () => {
//     await SmartPlug.find({}, (err:Error, docs:Document[]) =>{
//         smartPlugList.push(docs);
//     })
// }

export class SmartPlugRoute {
    public router: Router = express.Router();
    public path: string = "/smartPlug"

    /**
     * init route
     */
    constructor() {
        this.initRoutes();
        // populateArray();
    }

    public initRoutes() {
        this.router.get(this.path, this.getAllSmartPlugs);
    }

    getAllSmartPlugs = (req: Request, res: Response) => {
        SmartPlug.find({}, (err:Error, docs:Document[]) =>{
            res.json(docs);
        })
    }
}