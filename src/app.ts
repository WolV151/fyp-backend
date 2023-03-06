import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import { MqttClient } from "../middleware/mqtt"
import { mqttC } from "../middleware/mqtt"
import bodyParser from "body-parser";
import mongoose, { Document } from "mongoose";
import cors from "cors"

import { Telemetry } from "../model/telemetry"
import { SmartPlug } from "../model/smartPlug"
import { Device } from "../model/device";
import { smartPlugList, flag } from "../routes/smartPlug"
import { ITelemetry } from "../interface/ITelemetry";
import { IDevice } from "../interface/IDevice";
import { BackendRoute } from "../abstract/BackendRoute"

dotenv.config();

export class App {
    public app: Application;
    public port: string;
    public mqttClient: MqttClient;  // ugh.. I know this is rather confusing since the mqtt package class is also called MqttClient

    constructor(routes:BackendRoute[], port:string) {
        this.app = express();
        this.port = port;
        this.mqttClient = mqttC;

        this.initRoutes(routes);
        this.initMiddleWare();
    }

    private initMiddleWare() {
        mongoose.connect(`mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/
        ${process.env.DATABASE_NAME}?authSource=${process.env.DATABASE_AUTH_SOURCE}`,
            {
                user: process.env.DATABASE_USER_NAME,
                pass: process.env.DATABASE_USER_PASS,
                dbName: process.env.DATABASE_NAME
            });

        this.app.use(bodyParser.json())
        this.app.use(
            cors({
                origin: 'http:// localhost:4200',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                allowedHeaders: [
                    'Content-Type',
                    'Authorization',
                    'Origin',
                    'x-access-token',
                    'XSRF-TOKEN'
                ],
                preflightContinue: false
            })
        );
    }

    private initRoutes(routes:BackendRoute[]) {
        routes.forEach(r => this.app.use("/", r.router));

        this.app.get("/", (req: Request, res: Response) => {
            res.send("Hi lol");
        });

    }

    /**
     * listen
     */
    public listen() {
        this.mqttClient.client.on('message', async (topic, payload) => {
            console.log('Received Message: ' + topic);

            const msgJson:ITelemetry = JSON.parse(payload.toString())
            const telemetry:Document = new Telemetry({
                id: msgJson.id,
                data: {
                    voltage: msgJson.data.voltage,
                    current: msgJson.data.current,
                    power: msgJson.data.power,
                    power_factor: msgJson.data.power_factor,
                    timestamp: msgJson.data.timestamp
                }
            });

            if ((!smartPlugList.includes(msgJson.id)) && ((smartPlugList?.length) || (flag === 1))) {
                const smartPlug = new SmartPlug({ _id: msgJson.id });
                smartPlugList.push(msgJson.id);
                smartPlug.save((err) => {
                    if (err)
                        console.error(err);
                    else
                        console.log("Added New Device!")
                })
            }

            const device:Document = await Device.findOne({plug_id: msgJson.id})
            const deviceJson:IDevice = device.toJSON();

            if (deviceJson.threshold <= msgJson.data.current){
                telemetry.save((err) => {
                    if (err)
                        console.error(err);
                    else
                        console.log("Success");
                });
                console.log(msgJson);
            }



        });

        // start the express server
        this.app.listen(this.port, () => {
            console.log(`server started at http://localhost:${this.port}`);
        });
    }
}
