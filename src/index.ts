import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import UnauthorizedException from './api/auth/UnauthorizedException'
import routes from './routes'
import { NotFound } from './connections/interfaces'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(routes)

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof UnauthorizedException) {
    res.status(403).json()
  } else if (error instanceof NotFound) {
    res.status(404).json()
  } else {
    next()
  }
}

app.use(errorHandler)

const port = 3000

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
