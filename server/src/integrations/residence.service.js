import axios from "axios"
import dayjs from "dayjs"

async function getBrokers(token) {
    try {
        let brokers = []
        const response = await axios.get('https://residence.hbnetwork.ru/api/users/', {
            headers: { Authorization: `Bearer ${token}` },
            params: { 
                _page: 1, 
                _limit: 500,
            }
        })
        response.data.data.forEach((user) => {
            brokers.push({
                user: user?.name,
                employe: user?.integrations?.uis?.employeeId
            })
        })
        return brokers
    } catch (e) {
        console.log('ошбика получения бркоеров из резиденции', e.message)
    }
}

function getBrokerByEmployId(lead, users) {
    let brokerKey = users.find((item) => {
        return item.employe === lead.employeeId
    })
    return brokerKey
}

async function getLeads(token, gte, lte) {
    try {
        const response = await axios.get('https://residence.hbnetwork.ru/api/leads', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                startedAt: [
                    'gte:' + dayjs(gte).format('YYYY-MM-DD'),
                    'lte:' + dayjs(lte).format('YYYY-MM-DD')
                ],
                _select: 'status phone startedAt price',
                _limit: 0
            }
        })
        return response.data.data
    } catch (e) {
        console.log(`ошибка получения лидов из резиденции ${e.message}`)
    }
}

export { getBrokers, getLeads, getBrokerByEmployId }