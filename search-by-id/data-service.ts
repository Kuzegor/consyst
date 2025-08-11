      async getMissing(file?: any){    

        //��������� ���� ������

        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

        const fileName = await this.excelService.getFileName(file);

        const allExcelModels: ExcelModel[] = await this.excelService.getAll(file);

        const suooObjectsKeModels: SuooObjectsKeModel[] = await this.getAll();

        const objetsModels: SuooObjectsModel[] = await this.objectsService.getAll();

 

        //����� ��� ����������� ����������� ������ id

        const objKeVneshIDMap = {};

        suooObjectsKeModels.forEach(model => {

          if(model.serv_object_id){

            objKeVneshIDMap[model.serv_object_id] = model;

          }          

        });

        const objectIDMap = {};

        objetsModels.forEach(model => {

          if(model.serv_object_id){

            objectIDMap[model.serv_object_id] = model;

          }          

        });        

 

        //������������ ������

        const missingSuooKeArray: SuooObjectsKeModel[] = [];        

       

        for (const excelModel of allExcelModels) {            

          const servObjectId = excelModel.ID || excelModel.�����������;

          console.log(servObjectId, excelModel.ID, excelModel.�����������);

         

          const objectKeIsFound = objKeVneshIDMap[servObjectId] || null;

          const objectIsFound = objectIDMap[servObjectId] || null;

 

          if(servObjectId && !objectKeIsFound && objectIsFound){

            const newSuooKe: SuooObjectsKeModel = {

              serv_object_id: Number(servObjectId),

              code_ke: excelModel.���?.toString() || null,

              number_ke: excelModel.�����?.toString() || null,

              date: currentDate,

              file_name: fileName} as SuooObjectsKeModel;

 

            missingSuooKeArray.push(newSuooKe);

          }

        }  

 

        console.log(missingSuooKeArray);

        return missingSuooKeArray;

    }  