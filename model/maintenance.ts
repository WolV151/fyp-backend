import mongoose, { Model, Schema } from "mongoose";
import { IMaintenance } from "../interface/IMaintenance";


const maintenanceSchema: Schema<IMaintenance> = new Schema<IMaintenance>({
    date: {type: Date},
    details: {type: String},
    device_id: {type: String}
});

export const Maintenance: Model<IMaintenance> = mongoose.model<IMaintenance>("Maintenance", maintenanceSchema);