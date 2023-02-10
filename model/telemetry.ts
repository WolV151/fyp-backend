import mongoose, { Model, Schema } from "mongoose";
import { IData } from "../interface/IData";
import { ITelemetry } from "../interface/ITelemetry";


const dataSchema: Schema<IData> = new Schema<IData>({
    voltage: { type: Number },
    current: { type: Number },
    power: { type: Number },
    power_factor: { type: Number },
    timestamp: { type: String }
});

const telemetrySchema: Schema<ITelemetry> = new Schema<ITelemetry>({
    id: { type: String },
    data: { type: dataSchema }
});

export const Telemetry: Model<ITelemetry> = mongoose.model<ITelemetry>("Telemetry", telemetrySchema);