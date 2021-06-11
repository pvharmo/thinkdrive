/* eslint @typescript-eslint/explicit-module-boundary-types: "off", @typescript-eslint/no-explicit-any: "off" */

import winston from 'winston'

const NODE_ENV = process.env.NODE_ENV || 'dev'

const logger = winston.createLogger({
  level: 'info',
  levels: winston.config.npm.levels,
  format: winston.format.json(),
  transports: [],
  exitOnError: false,
  silent: false,
})

if (NODE_ENV === 'dev') {
  logger.add(
    new winston.transports.Console({
      handleExceptions: true,
      level: 'debug',
    })
  )
}

const debug = (msg: any) => {
  logger.debug(msg)
}

const error = (msg: any) => {
  logger.error(msg)
}

const warn = (msg: any) => {
  logger.warn(msg)
}

const info = (msg: any) => {
  logger.info(msg)
}

export default logger
