// OLD MYSQL DATABASE CONNECTION


// import {Connection, createConnection} from "mysql"
// import dotenv from "dotenv"

// dotenv.config()

// export const conn: Connection = createConnection({
//     host: process.env.DATABASE_HOST,
//     port: parseInt(process.env.DATABASE_PORT!, 10),
//     user: process.env.DATABASE_USER_NAME,
//     password: process.env.DATABASE_USER_PASSWORD,
//     database: process.env.DATABASE_NAME
// });

// conn.connect(err => {
//     if (err) throw err;
//     console.log("Connected!");
// });