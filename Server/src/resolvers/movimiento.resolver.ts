import { Arg, Authorized, Field, FieldResolver, Mutation, ObjectType, Resolver, ResolverInterface, Root } from "type-graphql";
import { baseResponse } from '../baseTypes/baseResponse.response';
import { Movimiento } from '../entity/Movimiento';
import { Sensor } from '../entity/Sensor';
import { newError } from '../utils/newError';
import { MovimientoEnum } from '../enums/movimiento.enum';

@ObjectType()
class movimientoResponse extends baseResponse{
    @Field(type => Movimiento, {nullable: true})
    data?: Movimiento 
}
@ObjectType()
class movimientosResponse extends baseResponse{
    @Field(type => [Movimiento], {nullable: true})
    data?: Movimiento[] 
}

@Resolver(of => Movimiento)
export class movimientoResolver{
    @Mutation(()=> movimientoResponse)
    async addMovimiento(
        @Arg('MacAddress') macAdress: string,
        @Arg('createdAt') createdAt: Date
    ){
        try {
            const existSensor = await Sensor.findOne({where: {macAdress}, relations: ["sucursal"]})
            if(!existSensor){
                return newError("Sensor", "el sensor espicificado no existe")
            }
            // acá podríamos meter algo para identificar que el sensor es quien dice ser
            //asumamos que lo es.
            //el createdAt param no se usa debería de venir por parametro para ser más exacto
            //hay que validar los argumentos en algun input type
            const HardcreatedAt = new Date().toISOString()
            const cantidadActual = await calcularCantidadActual(existSensor.type)
            const result = await Movimiento.create({
                createdAt: HardcreatedAt,
                type: existSensor.type,
                sucursal: existSensor.sucursal,
                cantidadActual
            }).save()
            return {data: result}
        } catch (err) {
            return newError("Error", "Ha ocurrido un error al añadir el movimiento")
        }
    }
}
const calcularCantidadActual = async(type: MovimientoEnum) => {
    const move = await Movimiento.createQueryBuilder("move")
        .orderBy("move.createdAt", "DESC")
        .getOne()
    let added: number
    if(type === MovimientoEnum.Ingreso){
        added = 1
    } else added = -1
    let cantidadActual = move?.cantidadActual ? move?.cantidadActual + added : added
    return cantidadActual
}