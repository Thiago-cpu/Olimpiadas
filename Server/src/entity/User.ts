import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne, OneToMany, Generated} from 'typeorm'
import { Role } from '../enums/role.enum';
import { Sucursal } from './Sucursal';
import { BaseModel } from '../baseTypes/BaseModel';

@ObjectType()
@Entity()
export class User extends BaseModel {
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
