import { Arg, Authorized, Field, FieldResolver, Mutation, ObjectType, Publisher, Resolver, ResolverInterface, Root, Subscription, PubSub, Ctx, Int, Query } from "type-graphql";
import { baseResponse } from '../baseTypes/baseResponse.response';
import { Movimiento } from '../entity/Movimiento';
import { Sensor } from '../entity/Sensor';
import { newError } from '../utils/newError';
import { MovimientoEnum } from '../enums/movimiento.enum';
import { PubSubEngine } from "graphql-subscriptions";
import { Sucursal } from '../entity/Sucursal';
import { isMySucursal } from "../decorators/isMySucursal";
import { query } from "express";

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

@ObjectType()
export class Notification {
  @Field(() => Int, { nullable: true } )
  cant?: number;

  @Field(() => Int, { nullable: true } )
  maxCant?: number;

  @Field(type => Date)
  date: Date;
}


@Resolver(of => Movimiento)
export class movimientoResolver{

    @Subscription({
        topics: "MOVIMIENTO",
        filter: ({ payload, args }) => payload.sucursalId === args.sucursalId
      })
    actualPeople(
        @Root() message: any,
        @Arg('sucursalId') sucursalId: string,
      ): Notification{
            return {cant: message.cant, maxCant: message.maxCant , date: new Date()}
    }

    @Authorized()
    @isMySucursal()
    @Query(() => movimientosResponse)
    async entriesByDate(
        @Arg('sucursalId') sucursalId: string,
        @Arg('skip',{nullable: true}) skip: number,
        @Arg('limit') limit: number
    ): Promise<movimientosResponse>{
        const moves = await Movimiento.moves(sucursalId, skip, limit)
        console.log(moves)
        return {data: await Movimiento.find()}
    }

    // @Authorized()
    // @isMySucursal()
    // @query(() => )

    @Query(() => movimientoResponse)
    async lastMove(@Arg('sucursalId') sucursalId: string): Promise<movimientoResponse>{
        const existSucursal = await Sucursal.findOne(sucursalId)
        if(!existSucursal){
            return newError("sucursal", "La sucursal no existe")
        }
        const lastmove = await Movimiento.findLastMove(sucursalId)
        if(!lastmove){
            return {data: Movimiento.create({
                cantidadActual: 0,
                sucursal: existSucursal,
            })}
        }
        return {data: lastmove}
    } 
    
    
    @Mutation(()=> movimientoResponse)
    async addMovimiento(
        @Arg('MacAddress') macAdress: string,
        @Arg('createdAt') createdAt: Date,
        @PubSub() pubSub: PubSubEngine
    ): Promise<movimientoResponse>{
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
            const cantidadActual = await calcularCantidadActual(existSensor.type, existSensor.sucursal.id)
            const result = await Movimiento.create({
                createdAt: HardcreatedAt,
                type: existSensor.type,
                sucursal: existSensor.sucursal,
                cantidadActual
            }).save()
            const maxCant = existSensor.sucursal.capacidadMaxima
            await pubSub.publish("MOVIMIENTO", {cant: cantidadActual, sucursalId: existSensor.sucursal.id, maxCant});
            return {data: result}
        } catch (err) {
            return newError("Error", "Ha ocurrido un error al añadir el movimiento")
        }
    }
}
const calcularCantidadActual = async(type: MovimientoEnum, sucursalId: string) => {
    const move = await Movimiento.findLastMove(sucursalId)
    let added: number
    if(type === MovimientoEnum.Ingreso){
        added = 1
    } else added = -1
    let cantidadActual = move?.cantidadActual ? move?.cantidadActual + added : added
    if(cantidadActual<0) cantidadActual = 0
    return cantidadActual
}