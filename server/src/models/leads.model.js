import { Schema, model } from "mongoose"
import dayjs from "dayjs"


const LeadsSchema = new Schema({
    datedAt: String,
    mailingName: String,
    mailingId: Number,
    phone: String,
    finallyLeadCode: {
        type: String,
        enum: ['base', 'new', 'auto']
    },
    finallyLeadPrice: {
        type: Number,
        enum: [5, 10]
    },
    isResidence: Boolean,
    broker: String,
    offerPrice: Number,
    statuses: [String],
    employeeId: String,
    uisInfo: {
        type: Schema.Types.Mixed
    }
})

LeadsSchema.statics.updateLead = async function (data) {
    try {
        const result = await this.findOneAndUpdate(
            { datedAt: data.datedAt, phone: data.phone },
            {
                $set: {
                    mailingName: data.mailingName,
                    mailingId: data.mailingId,
                    finallyLeadCode: data.finallyLeadCode,
                    finallyLeadPrice: data.finallyLeadPrice,
                    isResidence: data.isResidence,
                    employeeId: data.employeeId,
                    broker: data.broker,
                    offerPrice: data.offerPrice,
                    statuses: data.statuses,
                    uisInfo: data.uisInfo
                }
            },
            { upsert: true }
        )
        return result
    } catch (e) {
        console.log(`ошибка при обновление лида ${e.message}`)
    }
}

LeadsSchema.statics.getByDate = async function (gte, lte) {
    try {
        const data = await this.find({
            datedAt: {
                $gte: gte,
                $lte: lte
            }
        })
        return data
    } catch (e) {
        console.log(`ошибка при получение лидов за дату ${e.message}`)
        return null
    }
}

export default model('LeadsSchema', LeadsSchema)