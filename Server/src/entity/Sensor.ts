import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne} from 'typeorm'
import { MovimientoEnum } from '../enums/movimiento.enum';
import { Sucursal } from './Sucursal';


@ObjectType()
@Entity()
export class Sensor extends BaseEntity {
    @Field()
    @PrimaryColumn()
    id: string;

    @Field(type => MovimientoEnum)
    @Column({type: 'enum', enum: MovimientoEnum})
    type: MovimientoEnum

    @Field(() => Sucursal)
    @ManyToOne(() => Sucursal, sucursal => sucursal.sensores)
    sucursal: Sucursal
}
