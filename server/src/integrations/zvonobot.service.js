import axios from "axios"
import dayjs from "dayjs"

import finishedMailingsModel from "../models/finishedMailings.model.js"

async function getZvonobotMailings(token, gte, lte) {
    try {

        // TODO потом получать их из модели заврешеных расылок (напсиать мтеод для получения по дате)
        const completedMailings = await finishedMailingsModel.getByDate(gte, lte)
        const completedMailingsIds = []

        completedMailings.forEach((mailing) => {
            completedMailingsIds.push(mailing.mailingId)
        })


        const start = dayjs(gte).startOf('day').unix()
        const end = dayjs(lte).endOf('day').unix()
        
        const response = await axios.get('https://lk.zvonobot.ru/api/deliveries/getPagination', {
            headers: { "authorization": "Bearer " + token },
            params: {
                from: start,
                to: end,
                column: "created_at",
                order: "desc",
                page: 1,
                pageCapacity: 100
            }
        })

        let lastPage = response.data.data.lastPage
        let activeMailings = []

        const autoMailingsNames = ['haval', 'хавал', 'хончи', 'авто', 'эксид']

        for (let page = 1; page <= lastPage; page++) {
            try {
                const mailings = await axios.get('https://lk.zvonobot.ru/api/deliveries/getPagination', {
                    headers: { "authorization": "Bearer " + token },
                    params: {
                        from: start,
                        to: end,
                        column: "created_at",
                        order: "desc",
                        page: page,
                        pageCapacity: 100
                    }
                })

                mailings.data.data.data.forEach((mailing) => {

                    let mailingDate = dayjs(gte).format('YYYY-MM-DD')
                    let mailingName = mailing.name
                    let mailingId = mailing.id
                    let totalCalls = 0
                    let totalLeads = 0
                    let totalTransfers = 0
                    let totalSpent = 0
                    let mailingIsAuto = false
                    let mailingStatus = mailing.status
    
                    if (autoMailingsNames.some(substring => mailingName.toLowerCase().includes(substring.toLowerCase()))) {
                        mailingIsAuto = true
                    } else {
                        mailingIsAuto = false
                    }
    
                    if (mailingStatus !== "started" && !completedMailingsIds.includes(mailingId)) {
                        activeMailings.push({
                            mailingDate,
                            mailingName,
                            mailingId,
                            totalCalls,
                            totalLeads,
                            totalTransfers,
                            totalSpent,
                            mailingIsAuto,
                            mailingStatus
                        })
                    }
    
                })

            } catch (e) {
                console.error(`ошибка при получение расылок с ${page} >>> ${e.message}`)
                continue
            }
        }

        return activeMailings

    } catch (e) {
        console.log(`ошибка при получение расылок звонобота ${e.message}`)
    }
}

// обработка расылки
async function prepaingMailing(mailing) {
    try {

        paginationCallsOfMailing = await axios.post('https://lk.zvonobot.ru/api/calls/getPagination', {
            deliveryId: mailing.mailingId,
            pageCapacity: 100,
            page: 1,
            linkedFlag: 0
        }, {
            headers: { "authorization": "Bearer " + ZVONOBOT_TOKEN }
        })

        let lastPage = paginationCallsOfMailing.data.data.lastPage

        mailing.leadsInMailing = []
        mailing.totalCalls = 0
        mailing.totalLeads = 0
        mailing.totalSpent = 0

        for (let page = 1; page <= lastPage; page++) {
            try {
                mailingsCalls = await axios.post('https://lk.zvonobot.ru/api/calls/getPagination', {
                    deliveryId: mailing.mailingId,
                    pageCapacity: 100,
                    page: page,
                    linkedFlag: 0
                }, {
                    headers: { "authorization": "Bearer " + ZVONOBOT_TOKEN }
                })

                mailingsCalls.data.data.data.forEach((call) => {

                    let callIVRDigit = call.ivrDigit
                    let callCost = parseFloat(call.cost)
    
                    if (callIVRDigit === 5) {

                        let leadObject = {
                            datedAt: dayjs(mailing.mailingDate).format('YYYY-MM-DD'),
                            mailingName: mailing.mailingName,
                            mailingId: mailing.mailingId,
                            phone: call.phone.phone,
                            leadCode: mailing.mailingIsAuto ? 'auto' : 'new',
                            leadPrice: mailing.mailingIsAuto ? 5 :10,
                            isResidence: false,
                            broker: null,
                            offerPrice: 0,
                            statuses: []
                        }
    
                        // let phoneInEnvyBoxPhones = leadsFromEnvy.find((item) => {
                        //     return item.phone === callPhone
                        // })
    
                        // if (mailing.isAutoMailing === true) {
                        //     stage = 'Авто'
                        //     stageCode = 'auto',
                        //     stageColor = 'rgb(240, 230, 220)'
                        //     leadPrice = 5
                        //     isAuto = true
                        // } else if (mailing.isAutoMailing === false) {
                        //     if (phoneInEnvyBoxPhones) {
                        //         stage = phoneInEnvyBoxPhones.stage
                        //         stageCode = phoneInEnvyBoxPhones.stageCode
                        //         stageColor = phoneInEnvyBoxPhones.stageColor
                        //         leadPrice = phoneInEnvyBoxPhones.leadPrice
                        //         isAuto = false
                        //     }
    
                        // }
    
                        mailing.leadsInMailing.push(leadObject)
                        mailing.totalLeads += 1
                    }

                    mailing.totalCalls += 1
                    mailing.totalSpent += callCost
    
                })

            } catch (e) {
                console.error(`ошибка получения звонков в этой расылки ${mailing.mailingName}-${mailing.mailingId} ${e.message}`)
                continue
            }
            
        }

        return mailing

    } catch (e) {
        console.log(`ошибка обработка расылки`)
    }
}


export { getZvonobotMailings, prepaingMailing }