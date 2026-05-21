import express from 'express'
import axios from 'axios'
import dayjs from 'dayjs'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

import masterUpdateData from './src/crons/masterCron.js'


masterUpdateData(new Date, new Date)

dotenv.config()

const MONGO_URL = process.env.DATABASE_URL
const MONGO_USER = process.env.DATABASE_USERNAME
const MONGO_PASS = process.env.DATABASE_PASSWORD
const MONGO_PORT = process.env.DATABASE_PORT
const DATABASE_NAME = process.env.DATABASE_NAME

const server = express()

server.use(bodyParser.json())
server.use(cors())

async function startConnectToDB() {
    try {
        const uri = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_URL}:${MONGO_PORT}/${DATABASE_NAME}?authSource=admin`;
        await mongoose.connect(uri);
    } catch (err) {
        console.log(err);
    }
}

server.listen(3000, () => {
    startConnectToDB()
    console.log('server has been running')
})