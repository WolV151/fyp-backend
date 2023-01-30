import { MqttClient, connect} from "mqtt";
import dotenv from "dotenv";


dotenv.config();
const mqttBroker: string = process.env.MQTT_BROKER_HOST!;
const mqttPort: string = process.env.MQTT_BROKER_PORT!;
const mqttClientId: string = process.env.MQTT_CLIENT_ID!;

export const mqttClient: MqttClient = connect('mqtt://127.0.0.1:8080', {
    clean: true,
    connectTimeout: 4000,
    clientId: mqttClientId,
})

const mqttTopic: string = "/test"

mqttClient.on('connect', () => {
    console.log("Connected!")

    mqttClient.subscribe([mqttTopic], () => {
        console.log(`Subscribed to ${mqttTopic}.`);
    })
})
