import express from "express";
import dotenv from "dotenv";
import { conn } from "../model/db"
import { mqttClient } from "../model/mqtt"


dotenv.config();
const app = express();
const port: string = process.env.SERVER_PORT;

mqttClient.on('message', (topic, payload) => {
    console.log('Received Message: ' +  topic + " " + JSON.parse(payload.toString()));
})

const sql:string = "SHOW TABLES;"
conn.query(sql, (sqlerr, res) => {
    if (sqlerr) throw sqlerr;
    console.log(res);
})

app.get( "/", ( req, res ) => {
    res.send("Hi lol");
} );

// start the express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );