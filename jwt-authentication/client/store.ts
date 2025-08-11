import { configureStore } from "@reduxjs/toolkit";

import { api, authApi,userApi } from "./api/api";

import { tokenReducer } from "./reducers/token-slice";

 

const store = configureStore({

  reducer: {

    [api.reducerPath]: api.reducer,

    [authApi.reducerPath]: authApi.reducer,

    [userApi.reducerPath]: userApi.reducer,

    token: tokenReducer

  },

  middleware: (getDefaultMiddleware) =>

    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware).concat(authApi.middleware).concat(userApi.middleware)

})

 

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;