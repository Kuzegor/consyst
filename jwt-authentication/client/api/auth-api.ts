import { authApi } from "./api";

import { TAuthResponseDto } from "../types/auth-response-dto";

 

export const userAuthApi = authApi.injectEndpoints({

      endpoints: (builder) => ({

        getAuth: builder.mutation<TAuthResponseDto, { groups: string[], name: string, login: string}>({

            query: (body) => {

                return{

                  url: '/api/auth/login',

                  method: 'post',

                  body

                }

            }

        })

    })

})

 

export const {  

  useGetAuthMutation} = userAuthApi