import { Router } from "express"
import axios from "axios"
import dayjs from "dayjs"

const trafficRoute = Router()


trafficRoute.get('/getByDate', async (req, res) => {
    try {

        // data: {
        //  brokers: [{
        //      countInput (кол-во процент от звонков цена за 1)
        //      countLeads (кол-во процент от звонков цена за 1)
        //      countHolds (кол-во процент от звонков цена за 1)
        // }],
        // total: {
        //      countCalls (колво 'звонки' общая цена)
        //      countInputs (колво процент цена за 1)
        //      countLeads (колво процент цена за 1)
        //      countHolds (колво процены цена за 1)
        //  }
        // }

    } catch (e) {
        console.log(e.message)
    }
})


export default trafficRoute