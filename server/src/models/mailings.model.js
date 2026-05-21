import { Schema, model } from "mongoose"
import dayjs from "dayjs"


const MailingsSchema = new Schema({
    mailingDate: String,
    mailingName: String,
    mailingId: Number,
    totalCalls: Number,
    totalLeads: Number,
    totalTransfers: Number,
    totalSpent: Number
})

MailingsSchema.statics.updateData = async function (data) {
    try {
        const result = await this.findOneAndUpdate(
            { mailingDate: data.mailingDate, mailingId: data.mailingId },
            {
                $set: {
                    mailingName: data.mailingName,
                    totalCalls: data.totalCalls,
                    totalLeads: data.totalLeads,
                    totalTransfers: data.totalTransfers,
                    totalSpent: data.totalSpent
                }
            },
            { upsert: true }
        )
        return result 
    } catch (e) {
        console.log(`ошибка при обновление/сохранение новой расылки ${e.message}`)
    }
}

export default model('MailingsSchema', MailingsSchema)