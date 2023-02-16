import { App } from './app'
import { SmartPlugRoute } from '../routes/smartPlug'
import { UserRoute } from '../routes/user'
import { DeviceRoute } from '../routes/device'
import { MaintenanceRoute } from '../routes/maintenance'
import { CommandRoute } from "../routes/commands"

import dotenv from "dotenv"

dotenv.config()
const server = new App([new SmartPlugRoute(), new UserRoute(), new DeviceRoute(), new MaintenanceRoute(), new CommandRoute()], process.env.SERVER_PORT!)
server.listen();