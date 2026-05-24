import express from 'express'
import axios from 'axios'
import dayjs from 'dayjs'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import masterUpdateData from './src/crons/masterCron.js'

import leadsRouter from './src/routes/leads.router.js'
import mailingRouter from './src/routes/mailings.router.js'
import minusesRoute from './src/routes/minuses.route.js'
import trafficRoute from './src/routes/traffic.route.js'
import tokensRouter from './src/routes/tokens.router.js'

masterUpdateData(new Date(), new Date())

dotenv.config()

const MONGO_URL = process.env.DATABASE_URL
const MONGO_USER = process.env.DATABASE_USERNAME
const MONGO_PASS = process.env.DATABASE_PASSWORD
const MONGO_PORT = process.env.DATABASE_PORT
const DATABASE_NAME = process.env.DATABASE_NAME

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = express()

server.use(bodyParser.json())
server.use(cors())

server.use('/api/leads', leadsRouter)
server.use('/api/mailings', mailingRouter)
server.use('/api/minuses', minusesRoute)
server.use('/api/traffic', trafficRoute)
server.use('/api/tokens', tokensRouter)

// подклчюение html файлов

server.get('/tokens', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/tokens.html'))
})

server.get('/leads', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/leads.html'))
})

server.get('/minuses', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/minuses.html'))
})

server.get('/traffic', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/traffic.html'))
})

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