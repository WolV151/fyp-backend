/*
ALL OF THE TELEMETRY QUERY OPERATIONS WILL GO HERE:

1. CREATE AN INDEX ON "id" AND "device.timestamp" (DONE, also added on data.power)
2. CREATE UTILIZATION CALCULATION FUNCTION BASED ON: https://en.wikipedia.org/wiki/Utilization_facto
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
import { Document } from "mongoose";
import { IPowerConsumption } from "../interface/IPowerConsumption"

export class TelemetryRouter {
   public router: Router = express.Router();
   public path: string = "/telemetry";

   private totalConsumptionPath: string = "/totalPower";
   private totalConsumptJsPath: string = "/totalPowerTest";
   private mostConsumingPath: string = "/biggestConsumer";

   constructor() {
      this.initRoutes();
   }

   /**
    * initRoutes
    */
   public initRoutes() {
      this.router.get(this.path + this.totalConsumptionPath, this.getTotalPowerConsumption);
      this.router.get(this.path + this.totalConsumptJsPath, this.totalConsumptionJs);
      this.router.get(this.path + this.mostConsumingPath, this.biggestConsumingDevice);
   }


   private getTotalPowerConsumption = async (req: Request, res: Response) => {
      const telemDoc: Document[] = await Telemetry.aggregate([
         {
            $group: {
               _id: null,
               total: { $sum: "$data.power" }
            }
         }
      ], (err) => {
         if (err) {
            console.error(err);
            res.status(500).send("Internal error when handling power consumptions");
         } else
            res.status(200).json(telemDoc);
         res.end();
      });
   }

   private totalConsumptionJs = async (req: Request, res: Response) => {
      const telemDoc: Document[] = await Telemetry.find({});
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
      const telemDoc: Document[] = await Telemetry.find({});
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
         res.status(200).json(consumptions);
      }
      res.end();
   }



}