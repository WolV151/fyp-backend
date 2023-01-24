import express from "express";
import dotenv from "dotenv";
import { MqttClient, connect} from "mqtt";


dotenv.config();
const app = express();
const port = process.env.SERVER_PORT;

const mqttBroker: string = process.env.MQTT_BROKER_HOST;
const mqttPort: string = process.env.MQTT_BROKER_PORT;
const mqttClientId: string = process.env.MQTT_CLIENT_ID;

const client: MqttClient = connect('mqtt://127.0.0.1:8080', {
    clean: true,
    connectTimeout: 4000,
    clientId: mqttClientId,
})

const mqttTopic: string = "/test"

client.on('connect', () => {
    console.log("Connected!")

    client.subscribe([mqttTopic], () => {
        console.log(`Subscribed to ${mqttTopic}.`);
    })

    client.on('message', (topic, payload) => {
        console.log('Received Message: ' +  topic + " " + payload.toString())
    })

})


app.get( "/", ( req, res ) => {
    res.send("Hi lol");
} );

// start the express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
    console.log('Client status is: ' + client);
} );