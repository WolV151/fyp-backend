import { Device } from "../model/device"
import express, { Router, Request, Response } from "express";
import { Document } from "mongoose";
import bodyParser from "body-parser";

const jsonParser = bodyParser.json();

export class DeviceRoute {
    public router: Router = express.Router();
    public path: string = "/device"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path, this.getAllDevices);
        this.router.post(this.path, jsonParser, this.createNewDevice);
        this.router.delete(this.path + "/:id", this.deleteDevice);
        this.router.patch(this.path + "/:id", jsonParser, this.updateDevice);
    }

    public getAllDevices = async (req: Request, res: Response) => {
        const deviceDoc: Document[] = await Device.find({});
        res.json(deviceDoc);
    }

    public createNewDevice = async (req: Request, res: Response) => {
        const newDevice: Document = new Device({
            device_name: req.body.device_name,
            description: req.body.description,
            plug_id: req.body.plug_id
        });

        newDevice.save((err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal error when saving new device");
            }
            else
                res.status(200)
            res.end()
        })
    }


    public deleteDevice = (req: Request, res: Response) => {
        Device.findByIdAndDelete(req.params.id, (err: Error) => {
            if (err) {
                console.log(err);
                res.status(500).send("Internal error when deleting the device");
            }
            else
                res.status(200);
            res.end();
        })
    }


    public updateDevice = (req: Request, res: Response) => {
        Device.findByIdAndUpdate(req.params.id, {
            $set:
            {
                device_name: req.body.device_name,
                description: req.body.description,
                plug_id: req.body.plug_id
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