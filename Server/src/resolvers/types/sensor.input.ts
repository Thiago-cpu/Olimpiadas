import { Sensor } from '../../entity/Sensor';
import { ArgsType, Field, InputType } from 'type-graphql';
import { MovimientoEnum } from '../../enums/movimiento.enum';
import { Length } from 'class-validator';

@InputType()
export class sensorInput implements Partial<Sensor>{

    @Length(10,100)
    @Field()
    macAdress: string

    @Field(type => MovimientoEnum)
    type: MovimientoEnum
}
@InputType()
export class partialSensorInput implements Partial<sensorInput>{

    @Length(10,100)
    @Field({nullable: true})
    macAdress?: string

    @Field(()=> MovimientoEnum, {nullable: true})
    type?: MovimientoEnum
}
@InputType()
export class adminPartialSensorInput extends partialSensorInput{
    @Field({nullable: true})
    sucursal?: string
}