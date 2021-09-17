import { Arg, Mutation, Resolver, ObjectType, Field, Authorized, Query, Ctx } from 'type-graphql';
import { Sucursal } from '../entity/Sucursal';
import { sucursalInput } from './types/sucursal.input';
import { User } from '../entity/User';
import { Role } from '../enums/role.enum';
import { createBaseResolver } from '../baseTypes/baseResolver.resolver';
import { baseResponse } from '../baseTypes/baseResponse.response';
import { newError } from '../utils/newError';


@ObjectType()
class SucursalResponse extends baseResponse {
  @Field(() => Sucursal, { nullable: true })
  data?: Sucursal;
}

@ObjectType()
class SucursalesResponse extends baseResponse {
  @Field(() => [Sucursal], { nullable: true })
  data?: Sucursal[];
}
const SucursalBaseResolver = createBaseResolver(
    "Sucursal",
    sucursalInput,
    SucursalesResponse,
    Sucursal
)
@Resolver()
export class SucursalResolver extends SucursalBaseResolver{

    @Authorized(Role.Admin)
    @Mutation(()=> SucursalResponse)
    async addSucursal(@Arg("data") sucursalData: sucursalInput){
        console.log("1")
        const encargado = await User.findOne(sucursalData.encargadoId)
        if(!encargado){
            return newError("Form", "Usuario no encontrado")
        }
        console.log("2")
        const issetSucursal = await Sucursal.findOne({name: sucursalData.name})
        if(issetSucursal){
            return newError("Form", "El nombre ya está siendo utilizado")
        }
        const sucursal = await Sucursal.create({
            ...sucursalData,
            encargado
        }).save()
        return {data: sucursal}
    }

    @Authorized(Role.Admin)
    @Query(()=> SucursalesResponse)
    async getSucursalesOfUser(@Arg("userId") userId: string){
        const user = await User.findOne(userId,{relations:["sucursales"]})
        if(!user){
            return newError("getSucursalesOfUser", "Usuario no encontrado")
        }
        const sucursales = user.sucursales
        console.log(sucursales)
        return {data: sucursales}
    }
}