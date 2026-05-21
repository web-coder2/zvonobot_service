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
            { updatedAt: dayjs(new Date).format('YYYY-MM-DD') }
        )
        return result
    } catch (e) {
        console.log(`ошибка обновления токена ${e.message}`)
    }
}

TokensSchema.statics.getToken = async function(service) {
    try {
        const token = await this.findOne({
            service: service
        })
        return token.token
    } catch (e) {
        console.log(`ошибка при получение токена ${e.message}`)
        return null
    }
}

export default model('Tokens', TokensSchema)