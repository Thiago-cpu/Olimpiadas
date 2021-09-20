import { ArgsDictionary, createMethodDecorator } from "type-graphql";
import { MyContext } from '../utils/context.interface';
import { User } from '../entity/User';

export function isMySucursal() {
    return createMethodDecorator(async ({ args: {sucursalId}, context }:{args: ArgsDictionary,context: MyContext}, next) => {
        try{
            const userId = context.payload!.id
            const user = await User.findOne(userId, {relations: ["sucursales"]})
            if(!user){
                return new Error("Usuario no encontrado")
            }
            if(user.sucursales.some( sucursal => sucursal.id === sucursalId)){
                return next();
            }
            return new Error("Acceso denegado! No estás autorizado")
        }catch{
            return new Error("Error! No estás autorizado")
        }
    });
  }