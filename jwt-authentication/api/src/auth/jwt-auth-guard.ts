import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { JwtService } from '@nestjs/jwt';

import { User } from "./user-model";

 

@Injectable()

export class JwtAuthGuard implements CanActivate {

  constructor(private jwtService: JwtService) { }

 

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const req = context.switchToHttp().getRequest();

    try {      

      const authHeader = req.headers.authorization;

      const [bearer, token] = authHeader.split(' ');

 

      if (bearer !== 'Bearer' || !token) {

        throw new UnauthorizedException({ message: 'Пользователь не авторизован 1' });

      }

 

      const user = await this.jwtService.verifyAsync<User>(token, { secret: process.env.PRIVATE_KEY || 'SECRET' });

      req.user = user;

 

      if (user.expired === null || user.expired > Date.now()) return true;

      return false;

     

    } catch (e) {

      throw new UnauthorizedException({ message: 'Пользователь не авторизован 2' });

    }

  }

 

}