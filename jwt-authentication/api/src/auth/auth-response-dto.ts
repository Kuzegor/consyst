import { Role } from "src/roles";

 

export class AuthResponseDto {

  token: string;

  expired: number | null;

  roles: Role[];

}