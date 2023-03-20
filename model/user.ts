import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../interface/IUser";

const userSchema: Schema<IUser> = new Schema({
    username: {type: String},
    password: {type: String},
    role: {type: Number},
    token: {type: String}
})

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

