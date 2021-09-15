import { Role } from "../enums/role.enum";

export interface MyContext {
  user: {
    id: string,
    name: string,
    role: Role   
  };
  
}