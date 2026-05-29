import { Schema, model } from "mongoose"
import dayjs from "dayjs"


const LeadsSchema = new Schema({
    datedAt: String,
    startedAt: Date,
    mailingName: String,
    mailingId: Number,
    phone: String,

    isResidence: Boolean,
    broker: String,
    offerPrice: Number,
    statuses: [String],

    stage: String,
    stageCode: String,
    stagePrice: Number,
    isAuto: Boolean,
    envyCallId: Number,
    isFoundInEnvy: Boolean
})

LeadsSchema.statics.updateLead = async function (data) {
    try {
        const result = await this.findOneAndUpdate(
            { datedAt: data.datedAt, phone: data.phone },
            {
                $set: {
                    startedAt: data.startedAt,
                    mailingName: data.mailingName,
                    mailingId: data.mailingId,
                    isAuto: data.isAuto,
                    isResidence: data.isResidence,
                    broker: data.broker,
                    offerPrice: data.offerPrice,
                    statuses: data.statuses,
                    stageCode: data.stageCode,
                    stagePrice: data.stagePrice,
                    stage: data.stage,
                    envyCallId: data.envyCallId,
                    isFoundInEnvy: data.isFoundInEnvy
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