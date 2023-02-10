import { App } from './app'
import { SmartPlugRoute } from '../routes/smartPlug'
import dotenv from "dotenv"

dotenv.config()
const server = new App([new SmartPlugRoute()], process.env.SERVER_PORT!)
server.listen();