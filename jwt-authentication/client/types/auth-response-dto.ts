import React from 'react'

import { Role } from '../roles'

 

export type TAuthResponseDto = {

    token: string;

    expired: number | null;

    roles: Role[];

  }