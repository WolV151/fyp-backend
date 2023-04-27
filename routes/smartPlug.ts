import { SmartPlug } from "../model/smartPlug";
import express, { Router, Request, Response } from "express";
import { Device } from "../model/device";
import { ISmartPlug } from "../interface/ISmartPlug"
import { Document } from "mongoose";

export let smartPlugList: string[] = []
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
        smartPlugList = [];
        plugDoc.forEach(doc => smartPlugList.push(doc._id))
    }

    getAllSmartPlugs = async (req: Request, res: Response) => {
        await this.populateArray();

        if (!smartPlugList.length)
            flag = 1;

        const plugDoc:Document[] = await Device.find({}, {plug_id: 1, _id:0})
        plugDoc.forEach(e => {
            const json = e.toJSON();
            smartPlugList.splice(smartPlugList.indexOf(json.plug_id), 1);
        })

        res.json(smartPlugList);
    }
}