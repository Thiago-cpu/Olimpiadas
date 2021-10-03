import { ObjectType, Field, Int, ID } from "type-graphql";
import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  PrimaryColumn,
  In,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { MovimientoEnum } from "../enums/movimiento.enum";
import { Sucursal } from "./Sucursal";
import { BaseModel } from "../baseTypes/BaseModel";

@ObjectType()
@Entity()
export class Movimiento extends BaseModel {
  @Field()
  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @Field(() => MovimientoEnum)
  @Column({ type: "enum", enum: MovimientoEnum })
  type: MovimientoEnum;

  @Field(() => Int)
  @Column({ type: "int" })
  cantidadActual: number;

  @Field(() => Sucursal)
  @ManyToOne(() => Sucursal, (sucursal) => sucursal.movimientos, {
    nullable: false,
    cascade: true,
    onDelete: "CASCADE",
  })
  sucursal: Sucursal;

  static findLastMove(sucursalId: string) {
    return this.createQueryBuilder("move")
      .where("move.sucursalId = :sucursalId", { sucursalId })
      .orderBy("move.createdAt", "DESC")
      .leftJoinAndSelect("move.sucursal", "sucursal")
      .getOne();
  }

  // select COUNT(movimiento.type), DATE(movimiento.createdAt) from movimiento where movimiento.type = 'Ingreso' GROUP BY DATE(movimiento.createdAt)
  static moves(sucursalId: string, skip: number = 0, take: number = 10) {
    return this.createQueryBuilder("move")
      .select("COUNT(move.type)", "entries")
      .addSelect("move.id", "id")
      .addSelect("DATE(move.createdAt)", "fecha")
      .where("move.sucursalId = :sucursalId", {sucursalId})
      .andWhere("move.type = 'Ingreso'")
      .groupBy("DATE(move.createdAt)")
      .orderBy("move.createdAt", "DESC")
      .skip(skip)
      .take(take)
      .getRawMany()
  }
}
