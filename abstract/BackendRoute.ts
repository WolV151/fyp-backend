import { SmartPlug } from "../model/smartPlug";
import express, { Router, Request, Response } from "express";
import { Document } from "mongoose";

export abstract class BackendRoute {
    public router: Router = express.Router();
    abstract path: string;

    constructor(){
        this.initRoutes();
    }

    abstract initRoutes(): void;
}