import { verify } from "jsonwebtoken";
import { MyContext } from '../utils/context.interface';
import { User } from '../entity/User';

export const isAuthenticated = async(context: MyContext) => {
  const {req} = context
  const authorization = req.headers["authorization"] 
  if(!authorization){
      return false
  }
  try{
      const payload: any = await validateToken(authorization)
      const user = await User.findOne({id: payload.id})
      if(!user){
          return false
      }
      payload.role = user.role
      context.payload = payload
      return true

  }catch(err){
      return false
  }
}

export const validateToken = async(authorization: string) => {
    const result = verify(authorization.split(' ')[1], process.env.AUTH_SECRET || 'dev')
    return result
}