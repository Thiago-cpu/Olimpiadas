import { Arg, Mutation, Resolver, ObjectType, Field, Authorized, Query, Ctx, Args } from 'type-graphql';
import { Sucursal } from '../entity/Sucursal';
import { sucursalInput, adminPartialSucursalInput, partialSucursalInput } from './types/sucursal.input';
import { User } from '../entity/User';
import { Role } from '../enums/role.enum';
import { createBaseResolver } from '../baseTypes/baseResolver.resolver';
import { baseResponse } from '../baseTypes/baseResponse.response';
import { newError } from '../utils/newError';
import { extractNullProps } from '../utils/extractNullProps';
import { MyContext } from '../utils/context.interface';


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
    adminPartialSucursalInput,
    SucursalesResponse,
    Sucursal
)
@Resolver()
export class SucursalResolver extends SucursalBaseResolver{

    @Authorized(Role.Admin)
    @Query(()=> SucursalesResponse)
    async getSucursalesOfUser(@Arg("userId") userId: string){
        const user = await User.findOne(userId,{relations:["sucursales"]})
        if(!user){
            return newError("getSucursalesOfUser", "Usuario no encontrado")
        }
        const sucursales = user.sucursales
        return {data: sucursales}
    }

    @Authorized(Role.Admin)
    @Mutation(()=> SucursalResponse)
    async addSucursal(@Arg("data") sucursalData: sucursalInput){
        const encargado = await User.findOne(sucursalData.encargadoId)
        if(!encargado){
            return newError("Form", "Usuario no encontrado")
        }
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

    @Authorized()
    @Mutation(() => Boolean)
    async updateMySucursal(
        @Arg("data") args: partialSucursalInput,
        @Arg("sucursalId") sucursalId: string,
        @Ctx() {payload}: MyContext
    ){
        try{
            const argsNotNull = extractNullProps(args)
            const userId = payload!.id
            const user = await User.findOne(userId, {relations: ["sucursales"]})
            if(!user){
                return false
            }
            if(user.sucursales.some( sucursal => sucursal.id === sucursalId)){
                console.log("dueño de la sucursal")
                const result = await Sucursal.update(sucursalId, argsNotNull)
                return result.affected
            }
            return false
        }catch(err){
            return false
        }
    }
}