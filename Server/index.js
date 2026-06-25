import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/connectDb.js'
dotenv.config()
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import interviewRouter from './routes/interview.routes.js'
import paymentRouter from './routes/payment.routes.js'

const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())


app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDb()
})