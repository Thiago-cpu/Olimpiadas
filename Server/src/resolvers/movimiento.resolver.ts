import {
  Arg,
  Authorized,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Publisher,
  Resolver,
  ResolverInterface,
  Root,
  Subscription,
  PubSub,
  Ctx,
  Int,
  Query,
  Args,
  ArgsDictionary,
} from "type-graphql";
import { Between } from "typeorm";
import { baseResponse } from "../baseTypes/baseResponse.response";
import { Movimiento } from '../entity/Movimiento';
import { Sensor } from "../entity/Sensor";
import { newError } from "../utils/newError";
import { MovimientoEnum } from '../enums/movimiento.enum';
import { PubSubEngine } from "graphql-subscriptions";
import { Sucursal } from "../entity/Sucursal";
import { isMySucursal } from "../decorators/isMySucursal";
import PaginationArgs from './types/movimiento.input';
import { Role } from '../enums/role.enum';
import { addMovesPastMonthArgs } from './types/movimiento.input';
import UUID from 'graphql-type-uuid';

@ObjectType()
class movimientoResponse extends baseResponse {
  @Field((type) => Movimiento, { nullable: true })
  data?: Movimiento;
}
@ObjectType()
class movimientosResponse extends baseResponse {
  @Field((type) => [Movimiento], { nullable: true })
  data?: Movimiento[];
}

@ObjectType()
class entriesOfDate{
  @Field(() => UUID)
  id: string

  @Field(() => Int)
  entries: number

  @Field()
  fecha: Date
}

@ObjectType()
class entriesByDateResponse extends baseResponse {
  @Field(type => [entriesOfDate], { nullable: true })
  data?: entriesOfDate[]
}

@Resolver((of) => Movimiento)
export class movimientoResolver {
  @Subscription({
    topics: "MOVIMIENTO",
    filter: ({ payload, args }:{payload: Movimiento, args: ArgsDictionary}) => payload.sucursal.id === args.sucursalId,
  })
  actualPeople(
    @Root() move: Movimiento,
    @Arg("sucursalId") sucursalId: string
  ): Movimiento {
    return move;
  }

  @Authorized()
  @isMySucursal()
  @Query(() => entriesByDateResponse)
  async entriesByDate(
    @Arg("sucursalId") sucursalId: string,
    @Args() { skip, take }: PaginationArgs
  ): Promise<entriesByDateResponse> {
    try {
      const moves = await Movimiento.moves(sucursalId, skip, take);
      return { data: moves};
    } catch (error) {
      console.log(error)
      return newError("moves", "Algo fue mal")
    }
  }

  @Authorized()
  @isMySucursal()
  @Query(() => movimientosResponse)
  async moves(
    @Arg("sucursalId") sucursalId: string,
    @Arg("dia") dia: Date
    ): Promise<movimientosResponse> {
    try {
      const existSucursal = await Sucursal.findOne(sucursalId);
      if (!existSucursal) {
        return newError("sucursal", "La sucursal no existe");
      }
      const inicioDia = new Date(dia)
      inicioDia.setUTCHours(0,0,0,0)
      const finDia = new Date(dia)
      finDia.setUTCHours(23,59,59,999)
      const moves = await Movimiento.find({
        where: {
         sucursal: existSucursal, 
         createdAt: Between(inicioDia.toISOString(), finDia.toISOString()) 
        }, 
        order: { createdAt: "ASC" }
      });
      return { data: moves };
    } catch (error) {
      console.log(error)
      return newError("moves", "Algo fue mal")
    }
  }

  @Query(() => movimientoResponse)
  async lastMove(
    @Arg("sucursalId") sucursalId: string
  ): Promise<movimientoResponse> {
    const existSucursal = await Sucursal.findOne(sucursalId);
    if (!existSucursal) {
      return newError("sucursal", "La sucursal no existe");
    }
    const lastmove = await Movimiento.findLastMove(sucursalId);
    if (!lastmove) {
      return {
        data: Movimiento.create({
          cantidadActual: 0,
          sucursal: existSucursal,
        }),
      };
    }
    return { data: lastmove };
  }

  @Mutation(() => movimientoResponse)
  async addMovimiento(
    @Arg("MacAddress") macAdress: string,
    @Arg("createdAt") createdAt: Date,
    @PubSub() pubSub: PubSubEngine
  ): Promise<movimientoResponse> {
    try {
      const existSensor = await Sensor.findOne({
        where: { macAdress },
        relations: ["sucursal"],
      });
      if (!existSensor) {
        return newError("Sensor", "el sensor espicificado no existe");
      }
      // ac?? podr??amos meter algo para identificar que el sensor es quien dice ser
      //asumamos que lo es.
      //el createdAt param no se usa deber??a de venir por parametro para ser m??s exacto
      //hay que validar los argumentos en algun input type
      const HardcreatedAt = new Date().toISOString();
      const cantidadActual = await calcularCantidadActual(
        existSensor.type,
        existSensor.sucursal.id
      );
      const result = await Movimiento.create({
        createdAt: HardcreatedAt,
        type: existSensor.type,
        sucursal: existSensor.sucursal,
        cantidadActual,
      }).save();
      const maxCant = existSensor.sucursal.capacidadMaxima;
      await pubSub.publish("MOVIMIENTO", result);
      return { data: result };
    } catch (err) {
      return newError("Error", "Ha ocurrido un error al a??adir el movimiento");
    }
  }

  @Authorized(Role.Admin)
  @Mutation(() => Boolean)
  async addMovimientosAlongPastMonth(@Args() { minClients, sucursalId, maxClients, timeShopOpen, timeShopClose }: addMovesPastMonthArgs): Promise<Boolean> {
    const existSucursal = await Sucursal.findOne(sucursalId)
    if (!existSucursal) return false

    const today = new Date()

    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    let day = new Date(firstDay)
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)

    const input = []
    while (day <= lastDay) {
      const randClients = Math.trunc((Math.random() * (maxClients - minClients)) + minClients + 1)

      const startDay = new Date(day)
      startDay.setHours(timeShopOpen)

      const endDay = new Date(day)
      endDay.setHours(timeShopClose)

      const jornadaMinutes = (endDay.getHours() - startDay.getHours()) * 60

      const maxWaitForMove = Math.trunc(jornadaMinutes / randClients)

      let actualClients = 0
      let actualMoment = new Date(startDay)
      let totalMoves = randClients * 2
      for (let i = 1; i <= totalMoves; i++) {
        const waitForMove = Math.trunc((Math.random() * maxWaitForMove) + 1)
        let typeMove;
        let movesLeft = totalMoves - i + 1
        if (actualClients) {
          if (actualClients === existSucursal.capacidadMaxima || movesLeft === actualClients) {
            typeMove = MovimientoEnum.Egreso
          } else {
            Math.random() > 0.5
              ? typeMove = MovimientoEnum.Ingreso
              : typeMove = MovimientoEnum.Egreso
          }
        } else {
          if (i == totalMoves) {
            break;
          }
          typeMove = MovimientoEnum.Ingreso
        }
        actualMoment.setMinutes(actualMoment.getMinutes() + waitForMove)
        actualClients += typeMove === MovimientoEnum.Ingreso
          ? 1
          : -1

        input.push({
          createdAt: new Date(actualMoment),
          type: typeMove,
          sucursal: existSucursal,
          cantidadActual: actualClients,
        });
      }
      day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
    }
    await Movimiento.insert(input)
    return true
  }
}
const calcularCantidadActual = async (
  type: MovimientoEnum,
  sucursalId: string
) => {
  const move = await Movimiento.findLastMove(sucursalId);
  let added: number;
  if (type === MovimientoEnum.Ingreso) {
    added = 1;
  } else added = -1;
  let cantidadActual = move?.cantidadActual
    ? move?.cantidadActual + added
    : added;
  if (cantidadActual < 0) cantidadActual = 0;
  return cantidadActual;
};
