import mongoose, { Model, Schema } from "mongoose";
import { ISmartPlug } from "../interface/ISmartPlug";


const smartPlugSchema: Schema<ISmartPlug> = new Schema({
    _id: {type: String}
}, {versionKey: false});

export const SmartPlug: Model<ISmartPlug> = mongoose.model("SmartPlug", smartPlugSchema);