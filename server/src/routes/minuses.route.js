import { Router } from "express"
import dayjs from "dayjs"
import axios from "axios"

import leadsModel from "../models/leads.model.js"

const minusesRoute = Router()


minusesRoute.get('/byDate', async (req, res) => {
    try {
        
        const { gte, lte } = req.query

        const leadsByDate = await leadsModel.find({
            datedAt: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD'),
            }
        })

        let aggregatedData = {}

        console.log(leadsByDate, '!!!!!!')

        leadsByDate.forEach((lead) => {

            const isIncludesHold = lead.statuses.includes('hold') || lead.statuses.includes('confirmed') || lead.statuses.includes('refused')

            let priceToInput

            if (lead.isAuto === true) {
                priceToInput = 5
            } else {
                priceToInput = lead.stagePrice
            }

            if (aggregatedData[lead.broker]) {
                aggregatedData[lead.broker].countInputs += 1
                aggregatedData[lead.broker].countLeads += lead.isResidence ? 1 : 0
                aggregatedData[lead.broker].offerPrice += lead.offerPrice
                aggregatedData[lead.broker].countHold += isIncludesHold ? 1 : 0,
                aggregatedData[lead.broker].totalMinuses += priceToInput
                aggregatedData[lead.broker].countNew += lead.stageCode === 'new' && lead.isAuto === false ? 1 : 0
                aggregatedData[lead.broker].countBase += lead.stageCode === 'base' && lead.isAuto === false ? 1 : 0
                aggregatedData[lead.broker].countAuto += lead.isAuto === true ? 1 : 0

            } else {
                aggregatedData[lead.broker] = {
                    broker: lead.broker,
                    countInputs: 1,
                    countLeads: lead.isResidence ? 1 : 0,
                    offerPrice: lead.offerPrice,
                    countHold: isIncludesHold ? 1 : 0,
                    totalMinuses: priceToInput,
                    countNew: lead.stageCode === 'new' && lead.isAuto === false ? 1 : 0,
                    countBase: lead.stageCode === 'base' && lead.isAuto === false ? 1 : 0,
                    countAuto: lead.isAuto === true ? 1 : 0
                }
            }
        })

        aggregatedData = Object.values(aggregatedData)

        res.status(200).json({ data: aggregatedData })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

export default minusesRoute