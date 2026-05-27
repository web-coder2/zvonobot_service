import { Router } from "express"
import dayjs from "dayjs"
import axios from "axios"

import finishedMailingsModel from "../models/finishedMailings.model.js"
import mailingsModel from "../models/mailings.model.js"

const mailingRouter = Router()

mailingRouter.get('/getAll', async (req, res) => {
    try {
        const allMailings = await mailingsModel.find()
        res.status(200).json({ data: allMailings })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

mailingRouter.get('/getAllFinished', async (req, res) => {
    try {
        const allFinishedMailings = await finishedMailingsModel.find()
        res.status(200).json({ data: allFinishedMailings })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

mailingRouter.get('/getFinishedByDate', async (req, res) => {
    try {
        const { gte, lte } = req.query

        const finishedMailingsByDate = await finishedMailingsModel.find({
            mailingDate: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD'),
            }
        })
        res.status(200).json({ data: finishedMailingsByDate })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

mailingRouter.get('/getByDate', async (req, res) => {
    try {

        const { gte, lte } = req.query

        const mailingsByDate = await mailingsModel.find({
            mailingDate: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD'),
            }
        })
        res.status(200).json({ data: mailingsByDate })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

export default mailingRouter