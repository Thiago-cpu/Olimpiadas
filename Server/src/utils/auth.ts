import { sign } from "jsonwebtoken";
import { User } from "../entity/User";

export const createAuthToken = (usuario: User) => {
    const {name, role, id} = usuario
    return  sign({id, name, role}, process.env.AUTH_SECRET!,{
              expiresIn: '2m'
            })
}