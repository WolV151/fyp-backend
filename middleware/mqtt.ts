import { MqttClient as TMqttClient, connect} from "mqtt";
import dotenv from "dotenv";


dotenv.config();

export class MqttClient {
    private mqttBroker: string = process.env.MQTT_BROKER_HOST!;
    private mqttPort: string = process.env.MQTT_BROKER_PORT!;
    private mqttClientId: string = process.env.MQTT_CLIENT_ID!;
    private mqttTopic: string = process.env.MQTT_PUB_TOPIC!

    public client: TMqttClient;

    constructor() {
        this.client = connect(`mqtt://${this.mqttBroker}:${this.mqttPort}`, {
            clean: true,
            connectTimeout: 4000,
            clientId: this.mqttClientId,
            username: process.env.MQTT_USER!,
            password: process.env.MQTT_PASS!
        })
        this.handleSub();
    }

    private handleSub() {
        this.client.on('connect', () => {
            console.log("Connected!")

            this.client.subscribe([this.mqttTopic], () => {
                console.log(`Subscribed to ${this.mqttTopic}.`);
            })
        })
    }
}


