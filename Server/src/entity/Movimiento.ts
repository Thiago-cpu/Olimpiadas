import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne, CreateDateColumn} from 'typeorm'
import { MovimientoEnum } from '../enums/movimiento.enum';
import UUID from 'graphql-type-uuid'
import { Sucursal } from './Sucursal';

@ObjectType()
@Entity()
export class Movimiento extends BaseEntity {
    @Field(() => UUID)
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

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
}
