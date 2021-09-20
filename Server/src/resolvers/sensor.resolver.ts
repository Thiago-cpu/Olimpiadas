import { Arg, Authorized, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { isMySucursal } from "../decorators/isMySucursal";
import { Sensor } from '../entity/Sensor';
import { sensorInput, adminPartialSensorInput } from './types/sensor.input';
import { Sucursal } from '../entity/Sucursal';
import { baseResponse } from '../baseTypes/baseResponse.response';
import { newError } from '../utils/newError';
import { createBaseResolver } from '../baseTypes/baseResolver.resolver';

@ObjectType()
class sensorResponse extends baseResponse{
    @Field(type => Sensor, {nullable: true})
    data?: Sensor 
}
@ObjectType()
class sensoresResponse extends baseResponse{
    @Field(type => [Sensor], {nullable: true})
    data?: Sensor[] 
}
const sensorBaseResolver = createBaseResolver(
    "Sensor",
    adminPartialSensorInput,
    sensoresResponse,
    Sensor
)
@Resolver()
export class sensorResolver extends sensorBaseResolver {

    @Authorized()
    @isMySucursal()
    @Mutation(() => sensorResponse)
    async addSensor(
        @Arg("sucursalId") sucursalId: string,
        @Arg("data") args: sensorInput,
    ){
        try{
            const sucursal = await Sucursal.findOneOrFail(sucursalId)
            const sensorExists = await Sensor.findOne({macAdress: args.macAdress})
            if(sensorExists){
                return newError("Form", "Ya existe un sensor con esa macAdress")
            }
            const sensor = await Sensor.create({...args, sucursal}).save()
            return {data: sensor}
        }catch(err){
            console.log(err)
            return newError("Form", "Error")
        }
    }
}