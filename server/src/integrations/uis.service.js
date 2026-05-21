import axios from "axios"
import dayjs from "dayjs"
import https from "https"

async function getUIScalls(token, gte, lte, users) {
    try {
        let uisCalls = []

        const response = await axios.get('https://uis.hbnetwork.ru/api/legs', {
            params: {
                _createdAt: [dayjs(gte).format('YYYY-MM-DD'), dayjs(lte).format('YYYY-MM-DD')],
                _limit: 0,
            },
            headers: { Authorization: `Bearer ${token}` },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        })

        response.data.data.forEach((call) => {

            let userKey = users.find((item) => {
                return item.employe === call.employeeId
            })

            let broker = userKey ? userKey.user : 'Не определено'

            uisCalls.push({
                contactPhone: call.contactPhone,
                employeeId : call.employeeId,
                broker: broker,
            })
        })

        return uisCalls
    } catch (e) {
        console.log(`ошибка получения звонков из uis ${e.message}`)
    }
}

export { getUIScalls }