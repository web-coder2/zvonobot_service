import { Schema, model } from "mongoose"
import dayjs from "dayjs"


const finishedMailingsSchema = new Schema({
    mailingDate: String,
    mailingId: Number,
    mailingName: String,
    mailingStatus: String
})

finishedMailingsSchema.statics.getByDate = async function(gte, lte) {
    try {
        const data = await this.find({
            mailingDate: {
                $gte: gte,
                $lte: lte
            }
        })
        return data
    } catch (e) {
        console.log(`ошибка получения завершеных расылок ${e.message}`)
    }
}

finishedMailingsSchema.statics.update = async function(data) {
    try {
        const newFinishedMailing = new this({
            mailingDate: data.mailingDate,
            mailingId: data.mailingId,
            mailingName: data.mailingName,
            mailingStatus: data.mailingStatus,
        })
        const result = newFinishedMailing.save()
        return result
    } catch (e) {
        console.log(`ошибка сохранения заврешеной расылки ${e.message}`)
    }
}

export default model('finishedMailingsSchema', finishedMailingsSchema)