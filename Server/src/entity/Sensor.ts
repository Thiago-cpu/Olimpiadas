import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne} from 'typeorm'
import { MovimientoEnum } from '../enums/movimiento.enum';
import { Sucursal } from './Sucursal';
import { BaseModel } from '../baseTypes/BaseModel';


@ObjectType()
@Entity()
export class Sensor extends BaseModel {
    @Field()
    @Column({unique: true})
    macAdress: string

    @Field(type => MovimientoEnum,{defaultValue: MovimientoEnum.Ingreso})
    @Column({type: 'enum', enum: MovimientoEnum})
    type: MovimientoEnum

    @Field(() => Sucursal,{nullable: true})
    @ManyToOne(() => Sucursal, sucursal => sucursal.sensores)
    sucursal: Sucursal
}
