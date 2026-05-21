import axios from "axios"
import dayjs from "dayjs"
import https from "https"

async function getUIScalls(token, gte, lte) {
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
            uisCalls.push({
                contactPhone: call.contactPhone,
                employeeId : call.employeeId
            })
        })

        return uisCalls
    } catch (e) {
        console.log(`ошибка получения звонков из uis ${e.message}`)
    }
}

function setBrokersUIScalls(users, calls) {
    return users.map(user => {
        const uisEmployeId = uis.employe
        const userCalls = calls.filter(call => uisEmployeId === parseInt(call.employeeId)).map(call => (call.contactPhone))
        
        return {
            name: user.name,
            employe: uis.employe,
            uisCalls: userCalls
        }

    })
}

export { getUIScalls, setBrokersUIScalls }