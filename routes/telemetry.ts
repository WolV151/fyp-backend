/*
ALL OF THE TELEMETRY QUERY OPERATIONS WILL GO HERE:

1. CREATE AN INDEX ON "id" AND "device.timestamp" (DONE, also added on data.power)
2. CREATE UTILIZATION CALCULATION FUNCTION BASED ON: https://en.wikipedia.org/wiki/Utilization_factor
https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use
THIS WOULD ALLOW FOR SUMMARY CALCULATIONS SUCH AS:
        a. Most utilized equipment
        b. Least utilized equipment
        c. Additionally display utilization of all devices


3. CREATE QUERY TO FIND THE DEVICE(S) WITH MOST TOTAL POWER CONSUMPTION FOR A TIME PERIOD
4. CREATE QUERY TO FIND THE TOTAL POWER CONSUMPTION FOR A TIME RANGE

6. FUTURE: BASED ON THE RESEARCH, FIND SUITABLE LINE CHART GRAPH TO REPRESENT CURRENT USAGE FOR
   A CERTAIN DEVICE FOR ONE USAGE.


*/


import express, { Router, Request, Response } from "express"
import { Telemetry } from "../model/telemetry"
import { ITelemetry } from "../interface/ITelemetry";
import bodyParser from "body-parser"
import { Document } from "mongoose";
import { IPowerConsumption } from "../interface/record/IPowerConsumption"

const jsonParser = bodyParser.json();

export class TelemetryRouter {
   public router: Router = express.Router();
   public path: string = "/telemetry";

   private totalConsumptJsPath: string = "/totalPower";
   private mostConsumingPath: string = "/biggestConsumer";
   private findDeviceConsumptionPath: string = "/findDeviceConsumption/:id"

   constructor() {
      this.initRoutes();
   }

   /**
    * initRoutes
    */
   public initRoutes() {
      this.router.get(this.path + this.totalConsumptJsPath, jsonParser, this.totalConsumptionJs);
      this.router.get(this.path + this.mostConsumingPath, jsonParser, this.biggestConsumingDevice);
      this.router.get(this.path + this.findDeviceConsumptionPath, jsonParser, this.findDeviceConsumption);
   }


   private totalConsumptionJs = async (req: Request, res: Response) => {
      const telemDoc: Document[] = await Telemetry.find({"data.timestamp": {$gte: req.body.startDate, $lte: req.body.endDate}});
      let totalConsumption: number = 0;

      if (!telemDoc)
         res.status(500).send("Internal server error when handling telemetry");
      else {
         telemDoc.forEach((telemE: Document) => {
            const jsonTelem: ITelemetry = telemE.toJSON();

            if (jsonTelem.data.power !== undefined)
               totalConsumption += jsonTelem.data.power;
         });

         res.status(200).json((JSON.parse(`{"total": ${totalConsumption}}`)));
      }
      res.end();
   }

   private biggestConsumingDevice = async (req: Request, res: Response) => {
      const telemDoc: Document[] = await Telemetry.find({"data.timestamp":  {$gte: req.body.startDate, $lte: req.body.endDate}});
      const consumptions: Record<string, number> = {};
      const maxCons: IPowerConsumption = {
         device_id: "",
         consumption: 0,
      };

      if (!telemDoc)
         res.status(500).send("Internal server error when handling telemetry");
      else {
         telemDoc.forEach((telemE: Document) => {
            const jsonTelem: ITelemetry = telemE.toJSON();

            if (jsonTelem.data.power !== undefined) {
               if (!consumptions[jsonTelem.id])
                  consumptions[jsonTelem.id] = jsonTelem.data.power;
               else {
                  consumptions[jsonTelem.id] += jsonTelem.data.power;

                  if (consumptions[jsonTelem.id] > maxCons.consumption) {
                     maxCons.device_id = jsonTelem.id;
                     maxCons.consumption = consumptions[jsonTelem.id];
                  }
               }
            }

         });
         res.status(200).json([maxCons, consumptions]);
      }
      res.end();
   }

   private findDeviceConsumption = async (req:Request, res:Response) => {
      const telemDoc:Document[] = await Telemetry.find({"data.timestamp":  {$gte: req.body.startDate, $lte: req.body.endDate}, "id": req.params.id});
      const timeRangeConsumption: Record<string, number> = {};

      if(!telemDoc)
         res.status(500).send("Internal sever error")
      else {
         telemDoc.forEach((telemE:Document) => {
            const jsonTelem:ITelemetry = telemE.toJSON();
            if (jsonTelem.data.power !== undefined) {
               timeRangeConsumption[jsonTelem.data.timestamp.toISOString()] = jsonTelem.data.power;
            }
         });
         res.status(200).json(timeRangeConsumption);
      }
      res.end();
   }

}