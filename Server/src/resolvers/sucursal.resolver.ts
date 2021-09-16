import { Arg, Mutation, Resolver, ObjectType, Field } from 'type-graphql';
import { Sucursal } from '../entity/Sucursal';
import { sucursalInput } from "./types/sucursal.input";
import { User } from '../entity/User';
import { FieldError } from './types/fieldError.error';

@ObjectType()
class SucursalResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Sucursal, { nullable: true })
  sucursal?: Sucursal;
}

@Resolver()
export class SucursalResolver{

    //@Authorized(['Admin'])
    @Mutation(()=> SucursalResponse)
    async addSucursal(@Arg("data") sucursalData: sucursalInput){
        const encargado = await User.findOne(sucursalData.encargadoId)
        if(!encargado){
            return {errors: [{
                field: "user",
                message: "not found"
            }]}
        }
        const issetSucursal = await Sucursal.findOne({where:{name: sucursalData.name}})
        if(issetSucursal){
            return {errors: [{
                field: "sucursal",
                message: "name already taken"
            }]}
        }
        const sucursal = await Sucursal.create({
            ...sucursalData,
            encargado
        }).save()
        return {sucursal}
    }
}