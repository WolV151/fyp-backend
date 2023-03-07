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
import bodyParser, { json } from "body-parser"
import { Document, isObjectIdOrHexString } from "mongoose";
import { IPowerConsumption } from "../interface/record/IPowerConsumption"
import { IConsumptionSeries } from "../interface/record/IConsumptionSeries"
import { IDataSeries } from "../interface/record/IDataSeries"

const jsonParser = bodyParser.json();

export class TelemetryRouter {
   public router: Router = express.Router();
   public path: string = "/telemetry";

   private totalConsumptJsPath: string = "/totalPower/:startDate/:endDate";
   private mostConsumingPath: string = "/biggestConsumer/:startDate/:endDate";
   private findDeviceConsumptionPath: string = "/findDeviceConsumption/:id/:startDate/:endDate"

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
      const telemDoc: Document[] = await Telemetry.find({ "data.timestamp": { $gte: req.params.startDate, $lte: req.params.endDate } });
      let totalConsumption: number = 0;
      const plotObj: IDataSeries[] = [];  // stores complete data to be plotted

      if (!telemDoc)
         res.status(500).send("Internal server error when handling telemetry");
      else {
         telemDoc.forEach((telemE: Document) => {
            const jsonTelem: ITelemetry = telemE.toJSON();
            const consumptionSeries: IConsumptionSeries = {
               name: jsonTelem.data.timestamp.toISOString(),
               value: jsonTelem.data.power
            };

            const found:boolean = plotObj.some(e => e.name === jsonTelem.id);

            if (found) {
               plotObj.forEach(e => {
                  if (e.name === jsonTelem.id) {
                     e.series.push(consumptionSeries);
                  }
               })
            } else {
               const dataSeries: IDataSeries = { name: jsonTelem.id, series: [] };
               dataSeries.series.push(consumptionSeries);
               plotObj.push(dataSeries);
            }

            if (jsonTelem.data.power !== undefined)
            totalConsumption += jsonTelem.data.power;
      });

      res.status(200).json(plotObj);
      // res.status(200).json((JSON.parse(`{"total": ${totalConsumption}}`)));
   }
      res.end();
}

   private biggestConsumingDevice = async (req: Request, res: Response) => {
   const telemDoc: Document[] = await Telemetry.find({ "data.timestamp": { $gte: req.params.startDate, $lte: req.params.endDate } });
   const consumptions: Record<string, number> = {};
   const maxCons: IPowerConsumption = {
      device_id: "",
      consumption: 0,
   };
   const consumptionSeries: IConsumptionSeries[] = []

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

      for (const element of Object.keys(consumptions)) { // I have to do these ugly things
         const consumptionObj: IConsumptionSeries = { // cause of the front end graphs
            name: element,
            value: consumptions[element]
         };
         consumptionSeries.push(consumptionObj);
      }

      res.status(200).json(consumptionSeries);
   }
   res.end();
}

   private findDeviceConsumption = async (req: Request, res: Response) => {
   const telemDoc: Document[] = await Telemetry.find({ "data.timestamp": { $gte: req.params.startDate, $lte: req.params.endDate }, "id": req.params.id });
   const timeRangeConsumption: IConsumptionSeries[] = [];

   if (!telemDoc)
      res.status(500).send("Internal sever error")
   else {
      telemDoc.forEach((telemE: Document) => {
         const jsonTelem: ITelemetry = telemE.toJSON();
         const consumptionSeries: IConsumptionSeries = { name: null, value: null };
         if (jsonTelem.data.power !== undefined) {
            consumptionSeries.name = jsonTelem.data.timestamp.toISOString();
            consumptionSeries.value = jsonTelem.data.power;

            timeRangeConsumption.push(consumptionSeries);
         }
      });
      res.status(200).json(timeRangeConsumption);
   }
   res.end();
}

}