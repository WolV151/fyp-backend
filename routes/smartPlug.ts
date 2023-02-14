import { SmartPlug } from "../model/smartPlug";
import express, { Router, Request, Response } from "express";
import { Document } from "mongoose";

export const smartPlugList: string[] = []
export let flag = 0;  // empty or not

export class SmartPlugRoute {
    public router: Router = express.Router();
    public path: string = "/smartPlug"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path, this.getAllSmartPlugs);
    }

    public async populateArray() {
        const plugDoc:Document[] = await SmartPlug.find({}, {_id:1});
        plugDoc.forEach(doc => smartPlugList.push(doc._id))
    }

    getAllSmartPlugs = async (req: Request, res: Response) => {
        if (!smartPlugList?.length)
            await this.populateArray();

        if (!smartPlugList.length)
            flag = 1;

        res.send(smartPlugList);
    }
}