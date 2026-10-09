import 'reflect-metadata'
import http from 'http';
import os from 'os';
import './helpers/envLoader';
import { app } from './app';
import { AppDataSource } from './database/AppDataSource';
import { logger } from './helpers/logger';

const port = Number(process.env.PORT ?? '3000');

AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
  })
  .catch((error) => console.log(error));

const welcome = (p: number) => (): void =>
  logger.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port: ${p}}`);

http.createServer(app).listen(port, welcome(port));
