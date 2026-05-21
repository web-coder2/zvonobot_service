import axios from "axios"
import dayjs from "dayjs"

import tokenModel from '../models/tokens.model.js'
import { getZvonobotMailings, prepaingMailing } from '../integrations/zvonobot.service.js'

async function masterUpdateData(gte, lte) {
    try {

        console.log('masterCronData has been started !!!')

        // получить даные с звонобота (расылки завершеные расылки и лиды)
        // получить даные с uis для сопоставления лида с брокером и offerPrice и statuses
        // получить даные с Envy для сопоставления лида с leadCode leadPrice

        const zvonobotToken = await tokenModel.getToken('zvonobot')
        const zvonobotMailingsLeads = [] // з каждой расылки потом пушить этот масив

        const zvonobotMailings = await getZvonobotMailings(zvonobotToken, gte, lte)

        // после того как получил список активных расылок их нужно проитерироват ьи обработать

        console.log('Список активных ддля обработки расылок ....', zvonobotMailings)

    } catch (e) {
        console.log(`ошибка в мастер кроне ${e.message}`)
    }
}

export default masterUpdateData