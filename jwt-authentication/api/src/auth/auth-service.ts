import { Injectable, HttpException, HttpStatus, ConsoleLogger } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { Role } from 'src/roles';

import { AuthRequestDto } from './auth-request-dto';

import { AuthResponseDto } from './auth-response-dto';

import { User } from './user-model';

 

@Injectable()

export class AuthService {

    constructor( private readonly jwtService: JwtService

    ) {}

 

    async login(dto:AuthRequestDto): Promise<AuthResponseDto|null>{

        const roles: Role[] = [Role.Admin,Role.NS,Role.Employee,Role.Support];//TODO: ВЫДАВАТЬ РОЛИ ПО ГРУППАМ AD

        if(roles.length){

            let expired: number | null = Date.now();

            let dt = new Date(expired);

            dt.setDate(dt.getDate() + 1);

            expired = dt.getTime();            

            const user: User = { login: dto.login, name: dto.name, expired, roles }

            const token = await this.jwtService.signAsync(user, { secret: process.env.PRIVATE_KEY || 'SECRET' });          

            return { token, expired, roles }

        }

        else{

            console.log('Отказано в доступе');

            return null;

        }

    }

}