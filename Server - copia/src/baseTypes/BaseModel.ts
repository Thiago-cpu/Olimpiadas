import {ObjectType, Field, Int, ID} from 'type-graphql'
import {Column, PrimaryGeneratedColumn, Entity, PrimaryColumn, In, BaseEntity, ManyToOne, CreateDateColumn} from 'typeorm'
import UUID from 'graphql-type-uuid'


@ObjectType()
@Entity()
export class BaseModel extends BaseEntity {
    @Field(() => UUID)
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;
}