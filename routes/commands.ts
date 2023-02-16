// THIS FILE SHOULD CONTAIN THE ROUTES TO SEND JSON COMMANDS VIA THE MQTT BROKER TO THE SMART PLUGS
import express, { Router, Request, Response } from "express"
import dotenv from "dotenv"
import { ICommandFormat } from "../interface/IMqttCommands"
import { mqttC } from "../middleware/mqtt"
import bodyParser from "body-parser"
import { IClientPublishOptions } from "mqtt"

const jsonParser = bodyParser.json();
dotenv.config()

export class CommandRoute {
    public router: Router = express.Router();
    public path: string = "/command";

    public mqttTopic: string = process.env.MQTT_SUB_TOPIC!;

    private switchStatusPath: string = "/switch";
    private countDownSwitchPath: string = "/cdSwitch";
    private factoryResetPath: string = "/reset";
    private defaultStatusPath: string = "/defaultStat";
    private setPowerReportIntervalPath: string = "/repInterval";

    private pubOptions: IClientPublishOptions = { qos: 0, retain: true };

    constructor() {
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(this.path + this.switchStatusPath + "/:id/:stat", this.switchStatus);
        this.router.get(this.path + this.countDownSwitchPath + "/:id/:hrs/:min", this.countDownSwitch);
        this.router.get(this.path + this.factoryResetPath + "/:id", this.factoryReset);
        this.router.get(this.path + this.defaultStatusPath + "/:id/:stat", this.setDefaultStatus);
        this.router.get(this.path + this.setPowerReportIntervalPath + "/:id/:intval", this.setPowerReportInterval);
    }

    private switchStatus = (req: Request, res: Response) => {
        const message: ICommandFormat = {
            msg_id: 2001,
            id: req.params.id,
            data: {
                switch_state: req.params.stat
            }
        };

        console.log(JSON.stringify(message));

        mqttC.client.publish(this.mqttTopic, JSON.stringify(message), this.pubOptions, (err) => {
            if (err) {
                console.error(err)
                res.status(500).send("Internal error when sending command");
            }
            else
                res.status(200);
            res.end();
        });
    }

    private countDownSwitch = (req: Request, res: Response) => {
        const message: ICommandFormat = {
            msg_id: 2002,
            id: req.params.id,
            data: {
                delay_hour: req.params.hrs,
                delay_minute: req.params.min
            }
        };

        mqttC.client.publish(this.mqttTopic, JSON.stringify(message), this.pubOptions, (err) => {
            if (err) {
                console.error(err)
                res.status(500).send("Internal error when sending command");
            }
            else
                res.status(200);
            res.end();
        });
    }

    private factoryReset = (req: Request, res: Response) => {
        const message: ICommandFormat = {
            msg_id: 2006,
            id: req.params.id,
            data: null
        };

        mqttC.client.publish(this.mqttTopic, JSON.stringify(message), this.pubOptions, (err) => {
            if (err) {
                console.error(err)
                res.status(500).send("Internal error when sending command");
            }
            else
                res.status(200);
            res.end();
        });
    }

    private setDefaultStatus = (req:Request, res:Response) => {
        const message: ICommandFormat = {
            msg_id: 2002,
            id: req.params.id,
            data: {
                default_status: req.params.stat,
            }
        };

        mqttC.client.publish(this.mqttTopic, JSON.stringify(message), this.pubOptions, (err) => {
            if (err) {
                console.error(err)
                res.status(500).send("Internal error when sending command");
            }
            else
                res.status(200);
            res.end();
        });
    }

    private setPowerReportInterval = (req:Request, res:Response) => {
        const message: ICommandFormat = {
            msg_id: 2015,
            id: req.params.id,
            data: {
                report_interval: req.params.intval,
            }
        };

        mqttC.client.publish(this.mqttTopic, JSON.stringify(message), this.pubOptions, (err) => {
            if (err) {
                console.error(err)
                res.status(500).send("Internal error when sending command");
            }
            else
                res.status(200);
            res.end();
        });
    }
}
