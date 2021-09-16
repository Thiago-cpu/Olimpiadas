import { AuthChecker } from "type-graphql"; 
import { MyContext } from "../utils/context.interface";

export const authChecker: AuthChecker<MyContext> = ({ context: { payload } }, roles) => {
console.log({payload},{roles})
  if (roles.length === 0 || !payload) {
    return payload !== undefined;
  }
  if (roles.includes(payload.role)) {
    return true;
  }
  return false;
};