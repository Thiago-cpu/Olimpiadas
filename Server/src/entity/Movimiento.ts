import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne, CreateDateColumn} from 'typeorm'
import { MovimientoEnum } from '../enums/movimiento.enum';
import { Sucursal } from './Sucursal';
import { BaseModel } from '../baseTypes/BaseModel';


@ObjectType()
@Entity()
export class Movimiento extends BaseModel {
    @Field()
    @CreateDateColumn({type: "datetime"})
    createdAt: Date;

    @Field(() => MovimientoEnum)
    @Column({type: 'enum', enum: MovimientoEnum })
    type: MovimientoEnum;

    @Field(() => Int)
    @Column({type: "int"})
    cantidadActual: number

    @Field(() => Sucursal)
    @ManyToOne(() => Sucursal, sucursal => sucursal.movimientos, {nullable: false})
    sucursal: Sucursal

    static findLastMove(sucursalId: string){
        return this.createQueryBuilder("move")
            .where("move.sucursalId = :sucursalId", {sucursalId})
            .orderBy("move.createdAt", "DESC")
            .getOne()
    }
}
