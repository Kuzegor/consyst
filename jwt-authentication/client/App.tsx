import React from 'react';

import { useEffect, useState } from 'react';

import './App.css';

import { useGetUserInfoMutation } from './api/user-api';

import { useGetAuthMutation } from './api/auth-api';

import { useAppDispatch } from './hooks';

import { useAppSelector } from './hooks';

import {setAuth} from './reducers/token-slice';

import { RolesHeader } from './components/roles-header';

import { MainMenu } from './components/main-menu';

†

function App() {

†

†

†

† const dispatch = useAppDispatch();

† const [getUserInfo] = useGetUserInfoMutation();

† const [getAuth] = useGetAuthMutation();

† const [showContent, setShowContent] = useState<boolean>(false);

† const [showForbidden,setShowForbidden] = useState<boolean>(false);

†

† useEffect(() => {

† † getUserInfo({ login: '' }).unwrap().then(info => {

† † † console.log(info);

† † † getAuth({groups: info?.AD.Groups, name: info?.AD.FullName, login: info?.AD.Login}).unwrap().then(authData =>{

† † † † if(authData){

† † † † † dispatch(setAuth(authData));

† † † † † setShowForbidden(false);

† † † † † setShowContent(true);

† † † † }else{

† † † † † setShowContent(false);

† † † † † setShowForbidden(true);

† † † † } † † † †

† † † });

† † }); †

† }, [])

†

† return (

† † <div className="App"> † †

† † † {showContent &&<> † † † † † †

† † † † <RolesHeader/>

† † † † <MainMenu/>

† † † </>} † †

† † † {showForbidden &&<>

† † † † <div className='forbidden-div'>

† † † † † <div className='forbidden-message'>Œ“ ¿«¿ÕŒ ¬ ƒŒ—“”œ≈!!!</div> † † † † †

† † † † </div>

† † † </>}

† † </div>

† );

}

†

export default App;