import express from 'express'
import axios from 'axios'
import dayjs from 'dayjs'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'


const server = express()




server.listen(3000, () => {
    console.log('server has been running')
})