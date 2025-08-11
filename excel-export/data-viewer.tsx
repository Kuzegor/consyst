import React, { useEffect, useState } from 'react';

import { useGetIssueAllNoPaginationMutation, useGetIssueAllQuery, useGetIssueAmountQuery } from '../api/issue-api';

import {useGetProductTypeAllNoPaginationQuery} from '../api/product-type-api';

import {useGetConsumerAllNoPaginationQuery} from '../api/consumer-api';

import {SimpleObjectModel} from '../types/simple-object-model'

import {Table, Space, Spin, Tooltip} from 'antd';

import { PlusOutlined, DownloadOutlined, FilterOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

import '.././App.css';

import { IssueModel } from '../types/issue-model';

import { PageFilterDto } from '../types/page-filter-dtos';

import { FilterPopup } from './filter-popup';

import moment from 'moment';

import { ExportPopup } from './export-popup';

import * as XLSX from 'xlsx';

import { ExportIssueDto } from '../types/export-dtos';

import { IssueForm } from './issue-form';

import { ExportData } from '../enums/export-data';

import { Tab } from '../enums/tab';

 

export const IssueViewer = () =>{

 

    const [isLoading, setIsLoading] = useState<boolean>(true);    

    const [pageFilter, setPageFilter] = useState<PageFilterDto>({page: 1, size: 20,startDate: null,endDate: null,productTypeIds: null,consumerDeviceIds: null})

    const {data: issues, refetch: refetchIssues} = useGetIssueAllQuery(pageFilter);

    const {data: productTypes} = useGetProductTypeAllNoPaginationQuery();

    const {data: consumers} = useGetConsumerAllNoPaginationQuery();

    const [getAllFiltered] = useGetIssueAllNoPaginationMutation();

    const {data: productAmount, refetch: refetchProductAmount} = useGetIssueAmountQuery(pageFilter);

    useEffect(()=>{

        if(issues&&productTypes&&consumers){            

            setIsLoading(false);

        }

    },[issues,productTypes,consumers]);

    const refreshData = () =>{

        refetchIssues();

        refetchProductAmount();

    }

 

    const [showFilter, setShowFilter] = useState<boolean>(false);

    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

    const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);

    const [showExport, setShowExport] = useState<boolean>(false);

    const hidePopups = () =>{

        setShowFilter(false);

        setShowCreateForm(false);

        setShowUpdateForm(false);

        setShowExport(false);

        setSelectedModel(null);

    }

 

    const [selectedModel, setSelectedModel] = useState<IssueModel|null>(null);

 

    const submitFilters = (dto: PageFilterDto) => {

        setIsLoading(true);

        setPageFilter(prev => ({...prev, startDate: dto.startDate, endDate: dto.endDate, productTypeIds: dto.productTypeIds, consumerDeviceIds: dto.consumerDeviceIds}));  

        hidePopups();

        setIsLoading(false);

    }

    const cancelFilters = () =>{

        setIsLoading(true);

        setPageFilter(prev => ({...prev, startDate: null, endDate: null, productTypeIds: null, consumerDeviceIds: null}));  

        setIsLoading(false);

    }

    const downloadFile = async (dataToDownload: ExportData) =>{

        setIsLoading(true);

        if(issues?.rows&&issues?.rows.length){            

            let exportIssues: IssueModel[]|null = null;

 

            if(dataToDownload==ExportData.All){

                const {data: allFiltered} = await getAllFiltered(pageFilter);

                if(allFiltered?.rows){

                    exportIssues = allFiltered.rows;

                }

            } else if(dataToDownload==ExportData.CurrentPage){

                exportIssues = issues.rows;

            }

           

            if(exportIssues){

                const exportIssueDtos: ExportIssueDto[] = exportIssues.map(issue=>({

                    ID: issue.id,

                    Дата: issue.datetime,

                    Смена: issue.shift.name,

                    Сотрудник: issue.employee,

                    Вид_продукции: issue.productType.name,

                    Количество: issue.quantity,

                    Потребитель: issue.consumer.name,

                    Комментарий: issue.comment

                }))

                const worksheet = XLSX.utils.json_to_sheet(exportIssueDtos);

                const workbook = XLSX.utils.book_new();

                XLSX.utils.book_append_sheet(workbook,worksheet,'Страница 1');

                const date = new Date(Date.now());

                XLSX.writeFile(

                    workbook,

                    `АКС_${date.getFullYear()}_${date.getMonth()+1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}_Выдача${dataToDownload==ExportData.CurrentPage?'_Страница':''}${pageFilter.endDate||pageFilter.startDate||pageFilter.consumerDeviceIds||pageFilter.productTypeIds?'_Фильтрация':''}.ods`,

                    {bookType:'ods'});

            }

        }

        setIsLoading(false);

        hidePopups();

    }

   

    return(

        <>

        {isLoading && <div className='blank-canvas display-on-top'><Spin tip="Loading" size="large"></Spin></div>}

        {showFilter && <FilterPopup pageFilter={pageFilter} currentTab={Tab.Issue} submitFilters={submitFilters} productTypes={productTypes?.rows} consumersDevices={consumers?.rows} hidePopup={hidePopups}/>}

        {showCreateForm && <IssueForm model={null} setIsLoading={setIsLoading} productTypes={productTypes?.rows} consumers={consumers?.rows} refreshData={refreshData} hidePopup={hidePopups}/>}

        {showUpdateForm && <IssueForm model={selectedModel} setIsLoading={setIsLoading} productTypes={productTypes?.rows} consumers={consumers?.rows} refreshData={refreshData} hidePopup={hidePopups}/>}

        {showExport && <ExportPopup downloadFile={downloadFile} hidePopup={hidePopups}/>}

           <div className='controls-div'>

               <div className='amount-div'>Количество продукции в таблице: {productAmount} м<sup>3</sup></div>

               <div className='buttons-div'>

                   <a onClick={()=>setShowFilter(true)} className='filter-a'><Tooltip title='Фильтры'><FilterOutlined className='antd-icon'/></Tooltip></a>            

                   <a onClick={()=>cancelFilters()} className='filter-a'><Tooltip title='Отменить фильтры'><ReloadOutlined className='antd-icon'/></Tooltip></a>            

                   <a onClick={()=>{setIsLoading(true);setShowCreateForm(true)}} className='add-a'><Tooltip title='Новая запись'><PlusOutlined className='antd-icon'/></Tooltip></a>

                   <a onClick={()=>setShowExport(true)} className='export-a'><Tooltip title='Экспорт'><DownloadOutlined className='antd-icon'/></Tooltip></a>

               </div>                

           </div>

           {issues &&

           <Table<IssueModel>  

            pagination={{onChange: (page, size) =>{

                                                setIsLoading(true);

                                                setPageFilter(prev => ({...prev, page, size }));

                                                setIsLoading(false)},

                        pageSize: pageFilter.size,

                        current: pageFilter.page,

                        showSizeChanger: true,

                        pageSizeOptions: ['20','40','60','80','100'],

                        locale: {items_per_page: ""},

                        total: issues.count}}

            className='antd-table'

            dataSource={issues.rows}

            locale={{emptyText:'Нет данных'}}>

               <Table.Column sorter={(a,b)=>a.id - b.id} defaultSortOrder='descend' width={'5%'} title="ID" dataIndex="id" key="id"/>          

               <Table.Column sorter={(a,b)=>moment(a.datetime).valueOf() - moment(b.datetime).valueOf()} defaultSortOrder='descend' width={'15%'} title="Дата" dataIndex="datetime" key="datetime"

                render={(date)=>moment(date).format('YYYY-MM-DD HH:mm:ss')}/>  

               <Table.Column width={'10%'} title="Смена" dataIndex={['shift','name']} key="shift"/>  

               <Table.Column width={'10%'} title="Сотрудник" dataIndex="employee" key="employee"/>  

               <Table.Column width={'10%'} title="Вид продукции" dataIndex={['productType','name']} key="productType"/>  

               <Table.Column width={'10%'} title="Количество, м^3" dataIndex="quantity" key="quantity"/>  

               <Table.Column width={'10%'} title="Потребитель" dataIndex={['consumer','name']} key="consumer"/>  

               <Table.Column width={'20%'} title="Комментарий" dataIndex="comment" key="comment"/>        

               <Table.Column align='right' width={'10%'} title={'\u00A0\u00A0Действия'} key="action" render={(_:any,record: IssueModel)=>(

                   <Space size="middle">                                            

                       <a onClick={()=>{setSelectedModel(record);setShowUpdateForm(true)}} className='edit-a' ><Tooltip title="Редактировать"><EditOutlined className='antd-icon'/></Tooltip></a>

                       <a className='delete-a' ><Tooltip title='Удалить'><DeleteOutlined className='delete-icon'/></Tooltip></a>

                   </Space>

               )}/>

           </Table>  }

       </>

    )

}