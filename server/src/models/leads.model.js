import { Schema, model } from "mongoose"
import dayjs from "dayjs"


const LeadsSchema = new Schema({
    datedAt: String,
    mailingName: String,
    mailingId: Number,
    phone: String,
    leadCode: {
        type: String,
        enum: ['base', 'new', 'auto']
    },
    leadPrice: {
        type: Number,
        enum: [5, 10]
    },
    isResidence: Boolean,
    broker: String,
    offerPrice: Number,
    statuses: [String]
})

LeadsSchema.statics.updateLead = async function (data) {
    try {
        const result = await this.findOneAndUpdate(
            { datedAt: data.datedAt, phone: data.phone },
            {
                $set: {
                    mailingName: data.mailingName,
                    mailingId: data.mailingId,
                    leadCode: data.leadCode,
                    leadPrice: data.leadPrice,
                    isResidence: data.isResidence,
                    broker: data.broker,
                    offerPrice: data.offerPrice,
                    statuses: data.statuses,
                }
            }
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