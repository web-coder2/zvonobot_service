import axios from "axios"
import dayjs from "dayjs"

import tokenModel from '../models/tokens.model.js'
import mailingsModel from "../models/mailings.model.js"
import finishedMailingsModel from "../models/finishedMailings.model.js"

import { getZvonobotMailings, prepaingMailing } from '../integrations/zvonobot.service.js'
import { getBrokers, getLeads } from "../integrations/residence.service.js"
import { getUIScalls } from "../integrations/uis.service.js"

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
        let shortMailingsArray = zvonobotMailings.slice(1, 7)

        const brokers = await getBrokers(residenceToken)
        const uisCalls = await getUIScalls(uisToken, gte, lte, brokers)
        const residenceLeads = await getLeads(residenceToken, gte, lte)

        // for (let mailing of zvonobotMailings) {
        for (let mailing of shortMailingsArray) {
            // console.log(`идет итерация по расылки ${mailing.mailingName}:${mailing.mailingId}`)
            const fullMailingInfo = await prepaingMailing(mailing, zvonobotToken)
            zvonobotMailingsLeads.push(...fullMailingInfo.leadsInMailing)
            
            const miniResult = await mailingsModel.updateData(fullMailingInfo)

            if (fullMailingInfo.mailingStatus === 'finished' || fullMailingInfo.mailingStatus === 'stopped') {
                const result = await finishedMailingsModel.update(fullMailingInfo)
            }
        }

        zvonobotMailingsLeads.forEach((lead) => {
            let leadCallKey = uisCalls.find((call) => {
                return call.contactPhone === lead.phone
            })

            let residenceKey = residenceLeads.filter((item) => {
                return item.phone === lead.phone
            })

            if (leadCallKey) {
                lead.broker = leadCallKey.broker
            }

            if (residenceKey && residenceKey.length > 0) {
                lead.isResidence = true
                
                residenceKey.forEach((item) => {
                    lead.statuses.push(item.status)
                    lead.offerPrice += ['hold', 'confirmed', 'refused'].includes(item.status) ? item?.price?.offer : 0
                })
            }
        })

        // TODO написать дальше модуль с EnvyBox и делать сопоставление с лидом

        console.log('Список всех лидов собраных из всех расылок .....', zvonobotMailingsLeads)

    } catch (e) {
        console.log(`ошибка в мастер кроне ${e.message}`)
    }
}

export default masterUpdateData