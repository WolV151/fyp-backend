import { MqttClient, connect} from "mqtt";
import dotenv from "dotenv";


dotenv.config();
const mqttBroker: string = process.env.MQTT_BROKER_HOST!;
const mqttPort: string = process.env.MQTT_BROKER_PORT!;
const mqttClientId: string = process.env.MQTT_CLIENT_ID!;

export const mqttClient: MqttClient = connect(`mqtt://${mqttBroker}:${mqttPort}`, {
    clean: true,
    connectTimeout: 4000,
    clientId: mqttClientId,
    username: process.env.MQTT_USER!,
    password: process.env.MQTT_PASS!
})

const mqttTopic: string = process.env.MQTT_PUB_TOPIC!

mqttClient.on('connect', () => {
    console.log("Connected!")

    mqttClient.subscribe([mqttTopic], () => {
        console.log(`Subscribed to ${mqttTopic}.`);
    })
})
