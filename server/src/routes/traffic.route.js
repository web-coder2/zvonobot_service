import { Router } from "express"
import axios from "axios"
import dayjs from "dayjs"

import leadsModel from "../models/leads.model.js"
import mailingsModel from "../models/mailings.model.js"

import { getLeads } from "../integrations/residence.service.js"
import tokensModel from "../models/tokens.model.js"

const trafficRoute = Router()


function getResultByTraffic(user, totalSpent, gte, lte, countUsers = null) {

    const daysCount = dayjs(lte).startOf('day').diff(dayjs(gte).startOf('day'), 'day') + 1

    let clear = user.offerPrice * 0.6
    let brokersSalary = user.offerPrice * 0.6 * 0.15
    let office = 50000 * daysCount

    if (countUsers) {
        office = office / countUsers
    }

    let nalog = user.offerPrice * 0.6 * 0.07

    const resultTraffic = Math.round(clear - brokersSalary - office - nalog - totalSpent)
    return resultTraffic
}

function getTotalResultByTraffic(totalSumHold, totalSpent, gte, lte) {

    const daysCount = dayjs(lte).startOf('day').diff(dayjs(gte).startOf('day'), 'day') + 1

    let clear = totalSumHold * 0.6
    let brokersSalary = totalSumHold * 0.6 * 0.15
    let office = 50000 * daysCount
    let nalog = totalSumHold * 0.6 * 0.07

    const resultTraffic = Math.round(clear - brokersSalary - office - nalog - totalSpent)
    return resultTraffic
}

async function getResultTotal(totalSpent, gte, lte, broker = null, countUsers = null) {

    const daysCount = dayjs(lte).startOf('day').diff(dayjs(gte).startOf('day'), 'day') + 1
    const residenceToken = await tokensModel.getToken('residence')
    const residenceLeads = await getLeads(residenceToken, gte, lte) || []

    let holdsSum = 0

    residenceLeads.forEach((lead) => {
        if (['hold', 'confirmed', 'refused'].includes(lead.status) && broker === null) {
            holdsSum += lead?.price?.offer ?? 0
        }
    })

    residenceLeads.forEach((lead) => {
        if (['hold', 'confirmed', 'refused'].includes(lead.status) && broker !== null && broker === lead?.userId?.name) {
            holdsSum += lead?.price?.offer ?? 0
        }
    })

    let clear = holdsSum * 0.6
    let brokersSalary = holdsSum * 0.6 * 0.15
    let office = 50000 * daysCount

    if (broker && countUsers) {
        office = office / countUsers
    }

    let nalog = holdsSum * 0.6 * 0.07

    const resultTotal = Math.round(clear - brokersSalary - office - nalog - totalSpent)

    return resultTotal
}

trafficRoute.get('/getByDate', async (req, res) => {
    try {
        const { gte, lte } = req.query

        const leadsByDate = await leadsModel.find({
            datedAt: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD'),
            }
        })

        const mailingsByDate = await mailingsModel.find({
            mailingDate: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD'),
            }
        })

        let totalCalls = 0
        let totalSpent = 0
        let totalHold = 0

        mailingsByDate.forEach((mailing) => {
            totalCalls += mailing.totalCalls || 0
            totalSpent += mailing.totalSpent || 0
        })

        leadsByDate.forEach((lead) => {
            totalHold += lead.offerPrice
        })


        let total = {
            calls: {
                count: totalCalls,
                percent: 'Звонки',
                spent: Math.round(totalSpent)
            },
            inputs: {
                count: 0,
                percent: 0,
                spent: 0
            },
            leads: {
                count: 0,
                percent: 0,
                spent: 0
            },
            holds: {
                count: 0,
                percent: 0,
                spent: 0
            },
            result: {
                total: await getResultTotal(totalSpent, gte, lte),
                traffic: getTotalResultByTraffic(totalHold, totalSpent, gte, lte)
            }
        }

        let brokers = []

        let aggregatedData = {}

        leadsByDate.forEach((lead) => {

            const isIncludesHold = lead.statuses.includes('hold') || lead.statuses.includes('confirmed') || lead.statuses.includes('refused')

            if (aggregatedData[lead.broker]) {
                aggregatedData[lead.broker].countInputs += 1
                aggregatedData[lead.broker].countLeads += lead.isResidence ? 1 : 0
                aggregatedData[lead.broker].offerPrice += lead.offerPrice
                aggregatedData[lead.broker].countHold += isIncludesHold ? 1 : 0
            } else {
                aggregatedData[lead.broker] = {
                    broker: lead.broker,
                    countInputs: 1,
                    countLeads: lead.isResidence ? 1 : 0,
                    offerPrice: lead.offerPrice,
                    countHold: isIncludesHold ? 1 : 0
                }
            }
        })

        aggregatedData = Object.values(aggregatedData)

        aggregatedData.forEach((user) => {
            total.inputs.count += user.countInputs || 0
            total.leads.count += user.countLeads || 0
            total.holds.count += user.countHold || 0
        })

        let spentToInput = Math.round(total.calls.spent / total.inputs.count) || 0
        let spentToLead = Math.round(total.calls.spent / total.leads.count) || 0
        let spentToHold = Math.round(total.calls.spent / total.holds.count) || 0


        total.inputs.percent = Math.round((total.inputs.count / total.calls.count) * 100) || 0
        total.leads.percent = Math.round((total.leads.count / total.inputs.count) * 100) || 0
        total.holds.percent = Math.round((total.holds.count / total.inputs.count) * 100) || 0

        total.inputs.spent = spentToInput
        total.leads.spent = spentToLead
        total.holds.spent = spentToHold

        aggregatedData.forEach((user) => {
            brokers.push({
                broker: user.broker,
                offerPrice: user.offerPrice,
                inputs: {
                    count: user.countInputs,
                    percent: Math.round((user.countInputs / total.inputs.count) * 100),
                    totalSpent: Math.round(user.countInputs * spentToInput)
                },
                leads: {
                    count: user.countLeads,
                    percent: Math.round((user.countLeads / total.inputs.count) * 100),
                    totalSpent: Math.round(user.countLeads * spentToLead)
                },
                holds: {
                    count: user.countHold,
                    percent: Math.round((user.countHold / total.inputs.count) * 100),
                    totalSpent: Math.round(user.countHold * spentToHold)
                }
            })
        })

        for (let broker of brokers) {
            broker.result = {
                total: await getResultTotal(broker.inputs.totalSpent, gte, lte, broker.broker, brokers.length - 1),
                traffic: getResultByTraffic(broker, broker.inputs.totalSpent, gte, lte, brokers.length - 1)
            }
        }

        let trafficData = {
            total: total,
            brokers: brokers
        }

        // TODO позже использовать эти функции для получения резульатат трафика и общего для брокера и тотал

        res.status(200).json({ data: trafficData })

    } catch (e) {
        console.log(e.message)
    }
})


export default trafficRoute