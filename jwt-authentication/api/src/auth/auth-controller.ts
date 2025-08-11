import { Controller, Get, Param, Body,Post } from '@nestjs/common';

import { AuthService } from './auth-service';

import { AuthRequestDto } from './auth-request-dto';

 

@Controller('api/auth')

export class AuthController {

  constructor(private authService: AuthService){}

 

  @Post('/login')

  async login(@Body() dto: AuthRequestDto) {

    const res = await this.authService.login(dto);

    return res;

  }

}