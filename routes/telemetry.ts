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
import { Document, isObjectIdOrHexString, Query } from "mongoose";
import { IPowerConsumption } from "../interface/record/IPowerConsumption"
import { IConsumptionSeries } from "../interface/record/IConsumptionSeries"
import { IDataSeries } from "../interface/record/IDataSeries"
import { verifyJWT } from "../middleware/jwt";
import { IDevice } from "../interface/IDevice";
import { Device } from "../model/device";

const jsonParser = bodyParser.json();

export class TelemetryRouter {
   public router: Router = express.Router();
   public path: string = "/telemetry";

   private totalConsumptJsPath: string = "/totalPower/:startDate/:endDate";
   private mostConsumingPath: string = "/biggestConsumer/:startDate/:endDate";
   private findDeviceConsumptionPath: string = "/findDeviceConsumption/:id/:startDate?/:endDate?"
   private findUtilizationForDevicePath: string = "/findUtilization/:id/:startDate/:endDate"
   private returnAllTelemetryInRangePath: string = "/allConsumption/:startDate/:endDate"
   private returnElectricalPropertiesForOneMessagePath:string = "/electricalProperites/:id"

   constructor() {
      this.initRoutes();
   }

   /**
    * initRoutes
    */
   public initRoutes() {
      this.router.get(this.path + this.totalConsumptJsPath, [jsonParser, verifyJWT], this.totalConsumptionJs);
      this.router.get(this.path + this.mostConsumingPath, [jsonParser, verifyJWT], this.biggestConsumingDevice);
      this.router.get(this.path + this.findDeviceConsumptionPath, [jsonParser, verifyJWT], this.findDeviceConsumption);
      this.router.get(this.path + this.findUtilizationForDevicePath, verifyJWT, this.findUtilizationForDevice);
      this.router.get(this.path + this.returnAllTelemetryInRangePath, verifyJWT, this.returnAllTelemetryInRange);
      this.router.get(this.path + this.returnElectricalPropertiesForOneMessagePath, verifyJWT, this.returnElectricalPropertiesForOneMessage)
   }


   private totalConsumptionJs = async (req: Request, res: Response) => {
      const telemDoc: Document[] = await Telemetry.find({ "data.timestamp": { $gte: new Date(req.params.startDate), $lte: new Date(req.params.endDate) } });
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

            const found: boolean = plotObj.some(e => e.name === jsonTelem.id);

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
         // plotObj.forEach(e => {
         //    const assocDevice = Device.findOne({plug_id:e.name}, (err:Error, document: Document) => {
         //       if (err)
         //          console.error(err)

         //       const myJson:IDevice = document.toJSON();
         //       e.name = myJson.device_name;
         //    })

         // })
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
      let telemDoc: Document[] = [];

      if (req.params.startDate && req.params.endDate) {
         telemDoc = await Telemetry.find({ "data.timestamp": { $gte: req.params.startDate, $lte: req.params.endDate }, "id": req.params.id });
      } else {
         telemDoc = await Telemetry.find({ "id": req.params.id })
      }
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

   private findUtilizationForDevice = async (req: Request, res: Response) => {
      try {
         const messageCount: number = await Telemetry.where({ "data.timestamp": { $gte: req.params.startDate, $lte: req.params.endDate }, "id": req.params.id }).countDocuments();
         const hardCodedMessageTiming: number = 5;
         const startDate: number = new Date(req.params.startDate).valueOf();
         const endDate: number = new Date(req.params.endDate).valueOf();
         let totalDays: number = Math.floor((endDate - startDate) / (1000 * 3600 * 24));

         if (totalDays === 0)
            totalDays = 1;

         // 1 message per 5 seconds - 120 msg per minute - 7200 per hour - 172800 per day

         const utilizationPercentage: number = (messageCount / (totalDays * 172800) * 100)

         res.status(200).json(Number((utilizationPercentage).toFixed(4)));
      } catch (e) {
         console.error(e);
         res.status(500).send("Internal server error");
      } finally {
         res.end();
      }


   }

   private returnAllTelemetryInRange = async (req: Request, res: Response) => {
      const telemDoc: Document[] = await Telemetry.find({ "data.timestamp": { $gte: req.params.startDate, $lte: req.params.endDate } });
      const telemObjHolder: IConsumptionSeries[] = [];

      telemDoc.forEach(e => {
         const docJson: ITelemetry = e.toJSON();
         const serieMemeber: IConsumptionSeries = {
            name: docJson.id + " " + docJson.data.timestamp.toISOString(),
            value: docJson.data.power
         }
         telemObjHolder.push(serieMemeber);
      })

      if (!telemDoc)
         return res.sendStatus(500);
      else {
         res.json(telemObjHolder);
      }
   }

   private returnElectricalPropertiesForOneMessage = async (req:Request, res: Response) => {
      const telemDoc: Document = await Telemetry.findOne({"id": req.params.id})
      const returnObj: IConsumptionSeries[] = [];

      if(telemDoc) {
         const telemObj: ITelemetry = telemDoc.toJSON();

         const powerPerUsage: IConsumptionSeries = {
            name: "Power During Usage (Watts)",
            value: telemObj.data.power
         }

         const curretPerUsage: IConsumptionSeries = {
            name: "Electricity During Usage (Amps)",
            value: telemObj.data.current / 1000
         }

         const voltagePerUsage: IConsumptionSeries = {
            name: "Pressure During Usage (Voltage)",
            value: telemObj.data.voltage
         }
         returnObj.push(powerPerUsage);
         returnObj.push(curretPerUsage);
         returnObj.push(voltagePerUsage);

         res.json(returnObj);
      } else
         res.json([])

   }


}