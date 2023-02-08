import mongoose, { Model, Schema } from "mongoose";
import { IMaintenance } from "../interface/IMaintenance";


const maintenanceSchema: Schema<IMaintenance> = new Schema<IMaintenance>({
    maint_id: {type: String},
    date: {type: String},
    details: {type: String},
    device_id: {type: String}
});

export const Maintenance: Model<IMaintenance> = mongoose.model<IMaintenance>("Maintenance", maintenanceSchema);