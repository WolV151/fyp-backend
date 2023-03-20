import { App } from './app'
import { SmartPlugRoute } from '../routes/smartPlug'
import { UserRoute } from '../routes/user'
import { DeviceRoute } from '../routes/device'
import { MaintenanceRoute } from '../routes/maintenance'
import { CommandRoute } from "../routes/commands"
import { TelemetryRouter } from "../routes/telemetry"
import { LoginRoute } from "../routes/login"
import { RefreshRoute } from "../routes/tokenRefresh"
import { LogoutRoute} from "../routes/logout"

import dotenv from "dotenv"

dotenv.config()
const server = new App([

    new SmartPlugRoute(),
    new UserRoute(),
    new DeviceRoute(),
    new MaintenanceRoute(),
    new CommandRoute(),
    new TelemetryRouter(),
    new LoginRoute(),
    new RefreshRoute(),
    new LogoutRoute(),

], process.env.SERVER_PORT!)

server.listen();