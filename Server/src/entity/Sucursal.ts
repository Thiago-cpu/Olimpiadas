import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne, OneToMany} from 'typeorm'
import UUID from 'graphql-type-uuid'
import { User } from './User';
import { Sensor } from './Sensor';
import { Movimiento } from './Movimiento';

@ObjectType()
@Entity()
export class Sucursal extends BaseEntity {
    @Field(type => UUID)
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Field()
    @Column({length: 20, unique: true})
    name: string;

    @Field(() => Int)
    @Column({type: "int"})
    capacidadMaxima: number;

    @Field()
    @Column()
    localizacion: string;

    @Field(() => User)
    @ManyToOne(()=> User, user => user.sucursales, {nullable: false, cascade: true, onDelete: 'CASCADE'}, )
    encargado: User

    @Field(() => [Sensor], {nullable: true})
    @OneToMany(() => Sensor, sensor => sensor.sucursal)
    sensores: Sensor[]

    @Field(() => [Movimiento], {nullable: true})
    @OneToMany(() => Movimiento, movimiento => movimiento.sucursal)
    movimientos: Movimiento[]
}
