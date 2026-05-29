import axios from "axios"
import dayjs from "dayjs"
import cron from "node-cron"

import tokenModel from '../models/tokens.model.js'
import mailingsModel from "../models/mailings.model.js"
import finishedMailingsModel from "../models/finishedMailings.model.js"
import leadsModel from "../models/leads.model.js"

import { getZvonobotMailings, prepaingMailing } from '../integrations/zvonobot.service.js'
import { getBrokers, getLeads, getCallsByDate, getResidenceToken } from "../integrations/residence.service.js"
import { getUIScalls } from "../integrations/uis.service.js"
import { getEnvyBoxCalls } from "../integrations/envybox.service.js"

async function masterUpdateData(gte, lte) {
    try {

        console.log('masterCronData has been started !!!')


        const zvonobotToken = await tokenModel.getToken('zvonobot')
        const residenceToken = await getResidenceToken()
        
        // const residenceToken = await tokenModel.getToken('residence')
        // const uisToken = await tokenModel.getToken('uis')

        const zvonobotMailingsLeads = []

        const zvonobotMailings = await getZvonobotMailings(zvonobotToken, gte, lte) || []
        console.log('Список активных ддля обработки расылок ....', zvonobotMailings)

        // маисив 4 расылок дял теста сервиса чтобы долго не ждать
        // let shortMailingsArray = zvonobotMailings.slice(1, 10)

        const brokers = await getBrokers(residenceToken)

        // const uisCalls = await getUIScalls(uisToken, gte, lte, brokers)

        const residenceLeads = await getLeads(residenceToken, gte, lte)
        const envyboxCalls = await getEnvyBoxCalls(gte, lte)
        const residenceCalls = await getCallsByDate(residenceToken, gte, lte)

        for (let mailing of zvonobotMailings) {
        // for (let mailing of shortMailingsArray) {
            // console.log(`идет итерация по расылки ${mailing.mailingName}:${mailing.mailingId}`)
            const fullMailingInfo = await prepaingMailing(mailing, zvonobotToken)
            zvonobotMailingsLeads.push(...fullMailingInfo.leadsInMailing)
            // console.log(`получено с расылки ${fullMailingInfo.leadsInMailing.length} лидов`)
            const miniResult = await mailingsModel.updateData(fullMailingInfo)

            if (fullMailingInfo.mailingStatus === 'finished' || fullMailingInfo.mailingStatus === 'stopped') {
                const result = await finishedMailingsModel.update(fullMailingInfo)
            }

            fullMailingInfo.leadsInMailing.forEach((lead) => {
                // let leadCallKey = uisCalls.find((call) => {
                //     return call.contactPhone === lead.phone
                // })

                let residenceCallKey = residenceCalls.find((call) => {
                    return call.contactPhone === lead.phone
                })
    
                let residenceKey = residenceLeads.filter((item) => {
                    return item.phone === lead.phone
                })
    
                if (Array.isArray(envyboxCalls)) {
                    let envyCallKey = envyboxCalls.find((call) => {
                        return call.phone === lead.phone.replace(/\D/g, '')
                    })

                    if (envyCallKey) {
                        lead.stageCode = envyCallKey.stageCode
                        lead.stagePrice = envyCallKey.callPrice
                        lead.stage = envyCallKey.stage
                        lead.isFoundInEnvy = true
                    } else {
                        lead.stageCode = 'new'
                        lead.stagePrice = 10
                        lead.stage = 'Новый (нет в envy)'
                        lead.isFoundInEnvy = false
                    }
                }

                if (residenceCallKey) {
                    lead.broker = residenceCallKey.user
                }
    
                if (residenceKey && residenceKey.length > 0) {
                    lead.isResidence = true
                    
                    residenceKey.forEach((item) => {
                        lead.statuses.push(item.status)
                        lead.offerPrice += ['hold', 'confirmed', 'refused'].includes(item.status) ? item?.price?.offer : 0

                        // если с зарплатананя => звонки не сомг найти и сопоставить бркоера (но был перевод в residence) тогда из лидов возьмем
                        if (lead.isResidence === true && lead.broker === null) {
                            console.log(`нашелся лид без определеного но с переводом ${lead.phone} сопоставим ему ${item?.userId?.name}`)
                            lead.broker = item?.userId?.name || null
                        }

                    })

                }

            })

            for (let lead of fullMailingInfo.leadsInMailing) {

                console.log(lead, '!@*^#^&!@%*&#&!(@^*(!@(&*#P%*!@(*$(!@*&%$^(!@($&%^!@($(8')

                const result = await leadsModel.updateLead(lead)
            }

        }

    } catch (e) {
        console.log(`ошибка в мастер кроне ${e.message}`)
    }
}

function updateDataCron(schedule) {

    masterUpdateData(new Date, new Date)

    cron.schedule(schedule, () => {
        try {
            masterUpdateData(new Date, new Date)
            console.log(`функция обновления успешно вполнена ${schedule}`)
        } catch (e) {
            console.error(`Ошибка при обновление даных ${e.message}`)
        }
    })
}


export { masterUpdateData, updateDataCron }