import axios from "axios"
import dayjs from "dayjs"

import tokenModel from '../models/tokens.model.js'

async function masterUpdateData(gte, lte) {
    try {


        // получить даные с звонобота (расылки завершеные расылки и лиды)
        // получить даные с uis для сопоставления лида с брокером и offerPrice и statuses
        // получить даные с Envy для сопоставления лида с leadCode leadPrice



    } catch (e) {
        console.log(`ошибка в мастер кроне ${e.message}`)
    }
}