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
      const payload: any = verify(authorization.split(' ')[1], process.env.AUTH_SECRET!)
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