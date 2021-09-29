import { Request, Response } from "express";
import { Role } from "../enums/role.enum";

export interface MyContext {
  req: Request;
  res: Response;
  payload?: { 
    id: string,
    role: Role
  };
}
