import { AuthChecker } from "type-graphql"; 
import { MyContext } from '../utils/context.interface';
import { isAuthenticated } from './isAuthenticated';

export const authChecker: AuthChecker<MyContext> = async({ context }, roles) => {
  const isAuth = await isAuthenticated(context)
  if(!isAuth){
    return false
  }
  if (roles.length === 0) {
    return isAuth;
  }
  if (roles.includes(context.payload!.role)) {
    return true;
  }
  return false;
};