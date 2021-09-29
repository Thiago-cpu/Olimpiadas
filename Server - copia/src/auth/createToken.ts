import { sign } from "jsonwebtoken";
import { User } from "../entity/User";

export const createAuthToken = (user: User) => {
    const {id} = user
    return  sign({id}, process.env.AUTH_SECRET || 'dev',{
              expiresIn: '4h'
            })
}
export const createRefreshToken = (user: User) => {
  const {id} = user
  return sign(
    {id},
    process.env.REFRESH_SECRET || 'dev',
    {
      expiresIn: "7d"
    }
  );
};