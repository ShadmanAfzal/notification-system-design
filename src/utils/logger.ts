import winston from 'winston';
import env from './env';

const print = winston.format.printf(info => {
  const log = JSON.stringify({[info.level]: info.message});

  return info.stack ? `${log}\n${info.stack}` : log;
});

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(winston.format.errors({stack: true}), print),
  transports: [new winston.transports.Console()],
});

export default logger;
