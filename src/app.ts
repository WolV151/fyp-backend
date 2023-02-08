import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { mqttClient } from "../model/mqtt"
import { Telemetry } from "../model/telemetry"
import { SmartPlug } from "../model/smartPlug"
import { SmartPlugRoute, smartPlugList } from "../routes/smartPlug"
import mongoose from "mongoose";

dotenv.config();
const app: Express = express();

const port: string = process.env.SERVER_PORT;


mongoose.connect(`mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/
${process.env.DATABASE_NAME}?authSource=${process.env.DATABASE_AUTH_SOURCE}`,
    {
        user: process.env.DATABASE_USER_NAME,
        pass: process.env.DATABASE_USER_PASS,
        dbName: process.env.DATABASE_NAME
    });


mqttClient.on('message', (topic, payload) => {
    console.log('Received Message: ' + topic);

    const msgJson = JSON.parse(payload.toString())

    const telemetry = new Telemetry({
        id: msgJson.id,
        data: {
            voltage: msgJson.data.voltage,
            current: msgJson.data.current,
            power: msgJson.data.power,
            power_factor: msgJson.data.power_factor,
            timestamp: msgJson.data.timestamp
        }
    });


    if (!smartPlugList.includes(msgJson.id)) {
        const smartPlug = new SmartPlug({ _id: msgJson.id });

        smartPlug.save((err) => {
            if (err)
                console.error(err);
            else
                console.log("Added New Device!")
        })
    }

    telemetry.save((err) => {
        if (err)
            console.error(err);
        else
            console.log("Success");
    });

    console.log(msgJson.data);

})
const smartPlugRoute: SmartPlugRoute = new SmartPlugRoute()
app.use("/", smartPlugRoute.router);

app.get("/", (req: Request, res: Response) => {
    res.send("Hi lol");
});

// start the express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});