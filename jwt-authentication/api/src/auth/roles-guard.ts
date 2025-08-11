import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import { JwtService } from '@nestjs/jwt';

import { Role } from "src/roles";

import { ROLES_KEY } from "./roles-decorator";

import { User } from "./user-model";

 

@Injectable()

export class RolesGuard implements CanActivate {

  constructor(private jwtService: JwtService,

    private reflector: Reflector) { }

 

  async canActivate(context: ExecutionContext): Promise<boolean> {

   

    try {

      const requiredRoles: Role[] = this.reflector.getAllAndOverride(ROLES_KEY,[

        context.getHandler(),

        context.getClass()

      ]);

      const req = context.switchToHttp().getRequest();

      const authHeader = req.headers.authorization;

      const [bearer, token] = authHeader.split(' ');

 

      if (bearer !== 'Bearer' || !token) {

        throw new UnauthorizedException({ message: 'Пользователь не авторизован' });

      }

 

      const user = await this.jwtService.verifyAsync<User>(token, { secret: process.env.PRIVATE_KEY || 'SECRET' });

      req.user = user;

     

      if (requiredRoles.filter(x => user.roles.includes(x)).length > 0) return true;

      return false;

     

    } catch (e) {

      throw new UnauthorizedException({ message: 'Пользователь не авторизован' });

    }

  }

 

}