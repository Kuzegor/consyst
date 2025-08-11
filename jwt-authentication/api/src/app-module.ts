import { Module } from '@nestjs/common';

import { SequelizeModule } from '@nestjs/sequelize';

import { env } from 'process';

import { ConfigModule } from '@nestjs/config';

import { IssueModel } from './issue/issue-model';

import { ProductionModel } from './production/production-model';

import { DeviceModel } from './device/device-model';

import { ProductTypeModel } from './product-type/product-type-model';

import { ConsumerModel } from './consumer/consumer-model';

import { ShiftModel } from './shift/shift-model';

import { EventLogModel } from './event-log/event-log-model';

import { IssueModule } from './issue/issue-module';

import { ProductionModule } from './production/production-module';

import { DeviceModule } from './device/device-module';

import { ConsumerModule } from './consumer/consumer-module';

import { ShiftModule } from './shift/shift-module';

import { EventLogModule } from './event-log/event-log-module';

import { AuthModule } from './auth/auth-module';

import { ProductTypeModule } from './product-type/product-type-module';

import { EmployeeModule } from './employee/employee-module';

 

@Module({

  imports: [

    ConfigModule.forRoot({

      envFilePath: '.env'

    }),    

    SequelizeModule.forRoot({

      name: 'aes',

      dialect: 'mssql',

      host: process.env.AES_DB_HOST,

      port: Number(process.env.AES_DB_PORT),

      username: process.env.AES_DB_USERNAME,

      password: process.env.AES_DB_PASSWORD,

      database: process.env.AES_DB_DATABASE,

      models: [],

      autoLoadModels: false,

      synchronize: false,

      dialectModule: require('tedious'),

      dialectOptions: {

        options: {

          trustServerCertificate: true,

          cryptoCredentialsDetails: {

            minVersion: 'TLSv1'

          }

        }

      },

    }), EmployeeModule,

    SequelizeModule.forRoot({

      dialect: 'postgres',

      host: env.DB_HOST,

      port: Number(env.DB_PORT),

      username: env.DB_USERNAME,

      password: env.DB_PASSWORD,

      database: env.DB_DATABASE,

      models: [IssueModel,ProductionModel,DeviceModel,ProductTypeModel,ConsumerModel,ShiftModel,EventLogModel],

      autoLoadModels: true,

    }), IssueModule,ProductionModule,DeviceModule,ProductTypeModule,ConsumerModule,ShiftModule,EventLogModule, AuthModule]

})

export class AppModule {}

 