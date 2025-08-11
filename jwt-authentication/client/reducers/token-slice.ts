import React from 'react';

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { TAuthResponseDto } from '../types/auth-response-dto';

import { Role } from '../roles';

 

type TTokenState = {

    token: string;

    expired: number | null;

    roles: Role[];

  }

 

  const initialState: TTokenState = {

    token: '',

    expired: Date.now(),

    roles: []

  }

 

  export const tokenSlice = createSlice({

    name: 'token',

    initialState,

    reducers: {

      setToken: (state, action: PayloadAction<string>) => {

        state.token = action.payload;

      },

      setExpired: (state, action: PayloadAction<number | null>) => {

        state.expired = action.payload;

      },

      setRoles: (state, action: PayloadAction<Role[]>) => {

        state.roles = action.payload;

      },

      setAuth: (state, action: PayloadAction<TAuthResponseDto>) => {

        state.expired = action.payload.expired;

        state.token = action.payload.token;

        state.roles = action.payload.roles;

      }

    }

  })

 

  export const {

    setToken,

    setExpired,

    setAuth,

  } = tokenSlice.actions;

 

  export const tokenReducer = tokenSlice.reducer;