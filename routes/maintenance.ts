import { Maintenance } from "../model/maintenance"
import express, { Router, Request, Response } from "express";
import { Document } from "mongoose";
import bodyParser from "body-parser";

const jsonParser = bodyParser.json();

export class MaintenanceRoute {
    public router: Router = express.Router();
    public path: string = "/maintain"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path + "/:id", this.getAllMaintainByDeviceId);
        this.router.post(this.path, jsonParser, this.createNewMaintain);
        this.router.delete(this.path + "/:id", this.deleteMaintain);
        this.router.patch(this.path + "/:id", jsonParser, this.updateMaintain);
    }

    public getAllMaintainByDeviceId = async (req: Request, res: Response) => {
        const maintainDoc: Document[] = await Maintenance.find({device_id: req.params.id});
        res.json(maintainDoc);
    }

    public createNewMaintain = async (req: Request, res: Response) => {
        const newMaintain: Document = new Maintenance({
            date: req.body.date,
            details: req.body.details,
            device_id: req.body.device_id
        });

        newMaintain.save((err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal error when saving new device");
            }
            else
                res.status(200)
            res.end()
        })
    }


    public deleteMaintain = (req: Request, res: Response) => {
        Maintenance.findByIdAndDelete(req.params.id, (err: Error) => {
            if (err) {
                console.log(err);
                res.status(500).send("Internal error when deleting the device");
            }
            else
                res.status(200);
            res.end();
        })
    }


    public updateMaintain = (req: Request, res: Response) => {
        Maintenance.findByIdAndUpdate(req.params.id, {
            $set:
            {
                details: req.body.details,
                device_id: req.body.device_id
            }
        },
            (err: Error) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal error when updating the device");
                }
                else
                    res.status(200)
                res.end()
            })
    }
}