import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { ExcelModel } from './excel.model';

import { InjectModel } from '@nestjs/sequelize';

import * as xlsxReader from "xlsx";

 

@Injectable()

export class ExcelService {

    constructor(

            @InjectModel(ExcelModel)

            private suooModel: typeof ExcelModel

          ) {}

 

    async getAll(file?: Express.Multer.File){                

        try{

            const workbook = xlsxReader.read(file?.buffer, {type: 'buffer'});

            const sheet: xlsxReader.WorkSheet = workbook.Sheets["Реестр"];

            const jsonArray: ExcelModel[] = xlsxReader.utils.sheet_to_json<ExcelModel>(sheet);

            return jsonArray;

        } catch{

            throw new HttpException("Ошибка чтения файла",HttpStatus.UNPROCESSABLE_ENTITY);

        }

       

    }

 

    async getFileName(file?: Express.Multer.File){

        try{

            const fileName = Buffer.from(file!.originalname, 'latin1').toString('utf8');

            console.log(fileName);

            return fileName;

        } catch{

            throw new HttpException("Ошибка чтения файла",HttpStatus.UNPROCESSABLE_ENTITY);

        }

    }

 

}