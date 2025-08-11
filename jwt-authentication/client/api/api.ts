import { ConsoleSqlOutlined } from '@ant-design/icons';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootState } from '../store'

 

export const api = createApi({

  reducerPath: 'api',

  baseQuery: fetchBaseQuery({

    baseUrl: 'http://localhost:4934',

    prepareHeaders: (headers, { getState }) => {

      const token = (getState() as RootState).token.token;

      if (token) headers.set('authorization', `Bearer ${token}`);

      return headers;

    }

  }),

  tagTypes: ['product-types','consumers','devices'],

  endpoints: () => ({}),

})

 

export const authApi = createApi({

  reducerPath: 'authApi',

  baseQuery: fetchBaseQuery({

    baseUrl: 'http://localhost:4934',

    credentials: 'include'

  }),

  endpoints: () => ({}),

});

 

export const userApi = createApi({

  reducerPath: 'userApi',

  baseQuery: fetchBaseQuery({

    baseUrl: 'https://pacman.knpp.local:4909',

    credentials: 'include'

  }),

  endpoints: () => ({}),

});

 

export const queryTags = (type: string, result: { id: any }[]) => {

  return (result.map(({ id }) => ({

    type: type,

    id: id

  })))

}