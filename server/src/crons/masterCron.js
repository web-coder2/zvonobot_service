import axios from "axios"
import dayjs from "dayjs"

import tokenModel from '../models/tokens.model.js'
import mailingsModel from "../models/mailings.model.js"
import finishedMailingsModel from "../models/finishedMailings.model.js"
import leadsModel from "../models/leads.model.js"

import { getZvonobotMailings, prepaingMailing } from '../integrations/zvonobot.service.js'
import { getBrokers, getLeads } from "../integrations/residence.service.js"
import { getUIScalls } from "../integrations/uis.service.js"
import { getEnvyBoxCalls } from "../integrations/envybox.service.js"

async function masterUpdateData(gte, lte) {
    try {

        console.log('masterCronData has been started !!!')


        const zvonobotToken = await tokenModel.getToken('zvonobot')
        const residenceToken = await tokenModel.getToken('residence')
        const uisToken = await tokenModel.getToken('uis')

        const zvonobotMailingsLeads = []

        const zvonobotMailings = await getZvonobotMailings(zvonobotToken, gte, lte)
        // console.log('Список активных ддля обработки расылок ....', zvonobotMailings)

        // маисив 4 расылок дял теста сервиса чтобы долго не ждать
        let shortMailingsArray = zvonobotMailings.slice(1, 10)

        const brokers = await getBrokers(residenceToken)
        const uisCalls = await getUIScalls(uisToken, gte, lte, brokers)
        const residenceLeads = await getLeads(residenceToken, gte, lte)
        const envyboxCalls = await getEnvyBoxCalls(gte, lte)

        for (let mailing of zvonobotMailings) {
        // for (let mailing of shortMailingsArray) {
            console.log(`идет итерация по расылки ${mailing.mailingName}:${mailing.mailingId}`)
            const fullMailingInfo = await prepaingMailing(mailing, zvonobotToken)
            zvonobotMailingsLeads.push(...fullMailingInfo.leadsInMailing)
            console.log(`получено с расылки ${fullMailingInfo.leadsInMailing.length} лидов`)
            const miniResult = await mailingsModel.updateData(fullMailingInfo)

            if (fullMailingInfo.mailingStatus === 'finished' || fullMailingInfo.mailingStatus === 'stopped') {
                const result = await finishedMailingsModel.update(fullMailingInfo)
            }

            fullMailingInfo.leadsInMailing.forEach((lead) => {
                let leadCallKey = uisCalls.find((call) => {
                    return call.contactPhone === lead.phone
                })
    
                let residenceKey = residenceLeads.filter((item) => {
                    return item.phone === lead.phone
                })
    
                let envyCallKey = envyboxCalls.find((call) => {
                    return call.phone === lead.phone
                })
    
                if (leadCallKey) {
                    lead.broker = leadCallKey.broker
                }
    
                if (envyCallKey) {
                    lead.leadCode2 = envyCallKey.stageCode
                    lead.leadPrice2 = envyCallKey.callPrice
                }
    
                if (residenceKey && residenceKey.length > 0) {
                    lead.isResidence = true
                    
                    residenceKey.forEach((item) => {
                        lead.statuses.push(item.status)
                        lead.offerPrice += ['hold', 'confirmed', 'refused'].includes(item.status) ? item?.price?.offer : 0
                    })
                }
    
                if (lead.leadCode === 'auto') {
                    // если это из расылки по авто
                    lead.finallyLeadCode = 'auto'
                    lead.finallyLeadPrice = 5
                } else if (lead.leadCode !== 'auto' && lead.leadCode2) {
                    // если расылка не на авто и есть инфа от EnvyBox
                    lead.finallyLeadCode = lead.leadCode2
                    lead.finallyLeadPrice = lead.leadPrice2
                } else {
                    // если не авто и нет инфы от EnvyBox тогда дефолт значения
                    lead.finallyLeadCode = lead.leadCode
                    lead.finallyLeadPrice = lead.leadPrice
                }
            })

            for (let lead of fullMailingInfo.leadsInMailing) {
                const result = await leadsModel.updateLead(lead)
                console.log(result)
            }

        }

        console.log('Список всех лидов собраных из всех расылок .....', zvonobotMailingsLeads)

    } catch (e) {
        console.log(`ошибка в мастер кроне ${e.message}`)
    }
}


async function startManyCrons() {
    let start = '2026-05-18'
    let end = '2026-05-24'

    for (let now = dayjs(start).format('YYYY-MM-DD'); now <= dayjs(end).format('YYYY-MM-DD'); now = dayjs(now).add(1, 'day').format('YYYY-MM-DD')) {
        masterUpdateData(now)
    }

}

export { masterUpdateData, startManyCrons }