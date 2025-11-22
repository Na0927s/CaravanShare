import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { Caravan } from "./entities/Caravan"
import { Reservation } from "./entities/Reservation"
import { Payment } from "./entities/Payment"
import { Review } from "./entities/Review"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "caravan_user",
    password: "0927", // Use the password you set for caravan_user
    database: "caravan_share",
    synchronize: true, // WARNING: synchronize: true is for development only - disables migrations
    logging: false, // Set to true to see SQL queries in console
    entities: [User, Caravan, Reservation, Payment, Review], // Add our entities here
    migrations: [],
    subscribers: [],
})