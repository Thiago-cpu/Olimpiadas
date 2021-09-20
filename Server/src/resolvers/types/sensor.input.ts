import { Sensor } from '../../entity/Sensor';
import { Field, InputType } from 'type-graphql';
import { MovimientoEnum } from '../../enums/movimiento.enum';

@InputType()
export class sensorInput implements Partial<Sensor>{
    @Field()
    macAdress: string

    @Field(type => MovimientoEnum)
    type: MovimientoEnum
}
export class partialSensorInput implements Partial<sensorInput>{
    @Field({nullable: true})
    macAdress?: string

    @Field(()=> MovimientoEnum, {nullable: true})
    type?: MovimientoEnum
}
export class adminPartialSensorInput extends partialSensorInput{
    @Field({nullable: true})
    sucursal?: string
}