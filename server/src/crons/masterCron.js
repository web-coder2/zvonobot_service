import axios from "axios"
import dayjs from "dayjs"

import tokenModel from '../models/tokens.model.js'
import mailingsModel from "../models/mailings.model.js"
import finishedMailingsModel from "../models/finishedMailings.model.js"

import { getZvonobotMailings, prepaingMailing } from '../integrations/zvonobot.service.js'
import { getBrokers, getBrokerByEmployId } from "../integrations/residence.service.js"
import { getUIScalls, setBrokersUIScalls } from "../integrations/uis.service.js"

async function masterUpdateData(gte, lte) {
    try {

        console.log('masterCronData has been started !!!')

        // получить даные с звонобота (расылки завершеные расылки и лиды)
        // получить даные с uis и residence для сопоставления лида с брокером и offerPrice и statuses
        // получить даные с Envy для сопоставления лида с leadCode leadPrice

        const zvonobotToken = await tokenModel.getToken('zvonobot')
        const residenceToken = await tokenModel.getToken('residence')
        const uisToken = await tokenModel.getToken('uis')

        const zvonobotMailingsLeads = [] // з каждой расылки потом пушить этот масив

        // после того как получил список активных расылок их нужно проитерироват ьи обработать
        const zvonobotMailings = await getZvonobotMailings(zvonobotToken, gte, lte)
        // console.log('Список активных ддля обработки расылок ....', zvonobotMailings)

        // маисив 4 расылок дял теста сервиса чтобы долго не ждать
        let shortMailingsArray = zvonobotMailings.slice(1, 4)

        const brokers = await getBrokers(residenceToken)
        const uisCalls = await getUIScalls(uisToken, gte, lte)

        const complilledBrokers = setBrokersUIScalls(brokers, uisCalls)

        console.log(complilledBrokers, '!@^#*&!%@&*$%!*@&')

        // for (let mailing of zvonobotMailings) {
        for (let mailing of shortMailingsArray) {
            // console.log(`идет итерация по расылки ${mailing.mailingName}:${mailing.mailingId}`)
            const fullMailingInfo = await prepaingMailing(mailing, zvonobotToken)
            zvonobotMailingsLeads.push(...fullMailingInfo.leadsInMailing)
            
            const miniResult = await mailingsModel.updateData(fullMailingInfo)

            if (fullMailingInfo.mailingStatus === 'finished' || fullMailingInfo.mailingStatus === 'stopped') {
                const result = await finishedMailingsModel.updateMany(fullMailingInfo)
            }
        }

        // а тут маисв лидов проитерировать и собратьдял них полную инфу из envy uis и residence

        console.log('Список всех лидов собраных из всех расылок .....', zvonobotMailingsLeads)

    } catch (e) {
        console.log(`ошибка в мастер кроне ${e.message}`)
    }
}

export default masterUpdateData