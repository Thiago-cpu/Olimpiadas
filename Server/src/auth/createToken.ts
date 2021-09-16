import { sign } from "jsonwebtoken";
import { User } from "../entity/User";

export const createAuthToken = (user: User) => {
    const {name, role, id} = user
    return  sign({id, name, role}, process.env.AUTH_SECRET!,{
              expiresIn: '15m'
            })
}
export const createRefreshToken = (user: User) => {
  const {name, role, id} = user
  return sign(
    { id, name, role },
    process.env.REFRESH_SECRET!,
    {
      expiresIn: "7d"
    }
  );
};