import { Device } from "../model/device"
import express, { Router, Request, Response } from "express";
import { Document, Query } from "mongoose";
import bodyParser from "body-parser";
import { IDevice } from "../interface/IDevice";

const jsonParser = bodyParser.json();

export class DeviceRoute {
    public router: Router = express.Router();
    public path: string = "/device"

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path, this.getAllDevices);
        this.router.get(this.path + "/:id", this.findDeviceById);
        this.router.post(this.path, jsonParser, this.createNewDevice);
        this.router.post(this.path + "/delete", jsonParser, this.deleteDevice);  // REST doesn't really allow mass delete if not using req.params.query, so i made it use a body instead
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
            plug_id: req.body.plug_id,
            threshold: req.body.threshold
        });
        newDevice.save((err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal error when saving new device");
            }
            else
                res.json(newDevice);
            res.end()
        })
    }

    public findDeviceById = async (req:Request, res: Response) => {
        const deviceDoc: Document<IDevice> = await Device.findById(req.params.id)
        return res.status(200).json(deviceDoc);
    }


    public deleteDevice = (req: Request, res: Response) => {
        Device.deleteMany({
            _id: {
                $in: req.body
            }
        }, (err:Error) => {
            if (err){
                console.error(err);
                res.status(500).send("Internal server error.");
            } else
                res.status(200);
            res.end();

        })

        // Device.findByIdAndDelete(req.params.id, (err: Error) => {
        //     if (err) {
        //         console.log(err);
        //         res.status(500).send("Internal error when deleting the device");
        //     }
        //     else
        //         res.status(200);
        //     res.end();
        // })
    }


    public updateDevice = (req: Request, res: Response) => {
        console.log(req.body)
        Device.findByIdAndUpdate(req.params.id, {
            $set:
            {
                device_name: req.body.device_name,
                description: req.body.description,
                plug_id: req.body.plug_id,
                threshold: req.body.threshold
            }
        }, {new: true, returnDocument:'after'},
            (err: Error, updatedDoc:Document) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal error when updating the device");
                }
                else
                    res.json(updatedDoc);
                res.end()
            })
    }
}