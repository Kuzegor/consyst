import { userApi } from "./api";

import { TUser } from "../types/user-model";

 

export const getUserApi = userApi.injectEndpoints({

      endpoints: (builder) => ({

        getUserInfo: builder.mutation<TUser, any>({

            query: (body) => {

                return{

                  url: '/api/activedirectory/users',

                  method: 'post',

                  body

                }

            }

        })

    })

})

 

export const {

  useGetUserInfoMutation,

  } = getUserApi