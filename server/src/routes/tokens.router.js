import { Router } from 'express'
import axios from 'axios'
import dayjs from 'dayjs'

import tokensModel from '../models/tokens.model.js'

const tokensRouter = Router()

tokensRouter.get('/', async (req, res) => {
    try {
        const tokens = await tokensModel.find()
        res.status(200).json({ data: tokens })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

tokensRouter.post('/update', async (req, res) => {
    try {
        const { editService, editToken } = req.body
        const result = await tokensModel.updateToken(editService, editToken)
        res.status(200).json({ result })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})

export default tokensRouter