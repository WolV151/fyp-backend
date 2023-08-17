# FYP Backend
This is the back-end component of my Final Year Project for my BSc in Software Development.

## Topic
The goal of the project is to provide the user with a dashboard to monitor the electrical consumption and utilization of their appliances/devices. The problem behind this is to mitigate any potential energy waste that might be occuring by easily identifying it.

Additionally some management features are provided to the user:
- Switching the devices on/off remotely
- Setting a time delay after which the devices will switch on/off
- Setting the report interval on the Smart Plugs
- Creating maintenance logs/messages for the devices to store any maintenance information that was done on the device. (For instance, if a part was replaced or an issue addressed and how it was fixed)

## Architecture
![Architecture Diagram](/public/images/ArchitecturePoster.svg)

The Smart Plugs are attached to a device/appliance and measure the electrical properties every n number of seconds. These telemetry messages are then send to a mosquitto broker. The back-end will connect to this broker and consume the message, which it well then save into a MongoDB database. The messages are then stored in the following format:

![MQTT messages](/public/images/message.jpg)

## Backend Features
- Receive remote commands from the front-end and send to the MQTT broker and the plugs can read the comamnd.
- CRUD on appliances/device monitored
- CRUD User management
- CRUD maintenance logs
- Expose a route for all the unassigned Smart Plugs so that they can be attached to new devices
- JWT token verification/refresh
- Send telemetry in the required format for the front-end 

## Notable technologies
It is written entirely in TypeScript and runs in the Node.js using Express routers. Uses MQTT.js tp establish connection with mosquitto broker to retrive information from the smart plugs. User password are hashed using bcrypt.js. Originally, there was an idea to host the project on a public domain, therefore JWT authentication was implemented with a 5 minute authentication token and 1 day refresh token.

## Run
```npm run start```
