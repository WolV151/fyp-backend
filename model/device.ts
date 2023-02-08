import mongoose, { Model, Schema } from "mongoose";
import { IDevice } from "../interface/IDevice";

const deviceSchema: Schema<IDevice> = new Schema({
    device_id: {type: String},
    device_name:{type: String},
    description: {type: String},
    plug_id: {type: String}  // obviously inteded as a foreign key despite using non-relational db.
});

export const Device: Model<IDevice> = mongoose.model("Device", deviceSchema);