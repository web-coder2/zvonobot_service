import { Router } from 'express'
import axios from 'axios'
import dayjs from 'dayjs'

import leadsModel from '../models/leads.model.js'

const leadsRouter = Router()

leadsRouter.get('/getAll', async (req, res) => {
    try {
        const leadsData = await leadsModel.find()
        res.status(200).json({ data: leadsData })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

leadsRouter.get('/getByData', async (req, res) => {
    try {

        const { gte, lte } = req.query

        const leadsByDate = await leadsModel.find({
            datedAt: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD'),
            }
        })

        res.status(200).json({ data: leadsByDate })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

export default leadsRouter