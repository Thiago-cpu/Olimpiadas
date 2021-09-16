import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne, OneToMany, Generated} from 'typeorm'
import { Role } from '../enums/role.enum';
import UUID from 'graphql-type-uuid'
import { Sucursal } from './Sucursal';

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => UUID)
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Field()
    @Column({unique: true, length: 15})
    name: string;
    
    @Column()
    password: string;

    @Field(type => Role)
    @Column({type: 'enum', enum: Role, default: Role.Encargado })
    role: Role

    @Field(() => [Sucursal], {nullable: true})
    @OneToMany(()=> Sucursal, sucursal => sucursal.encargado)
    sucursales: Sucursal[]
}
