import { Schema, model } from "mongoose"
import dayjs from "dayjs"

const TokensSchema = new Schema({
    service: String,
    token: String,
    updatedAt: String
})

TokensSchema.statics.updateToken = async function(service, token) {
    try {
        const result = await this.findOneAndUpdate(
            { service: service },
            {
                $set: {
                    token: token
                }
            },
            { updatedAt: dayjs(new Date).format('YYYY-MM-DD:HH-mm-ss') }
        )
        return result
    } catch (e) {
        console.log(`ошибка обновления токена ${e.message}`)
    }
}

export default model('Tokens', TokensSchema)