import { Role } from "src/roles";

 

export class User {

  login: string;

  name: string | null;

  expired: number | null;

  roles: Role[];

}