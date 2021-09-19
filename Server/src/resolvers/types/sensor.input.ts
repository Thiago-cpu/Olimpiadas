import { Sensor } from '../../entity/Sensor';
import { Field, InputType } from 'type-graphql';
import { MovimientoEnum } from '../../enums/movimiento.enum';

@InputType()
export class sensorInput implements Partial<Sensor>{
    @Field()
    macAdress: string

    @Field(type => MovimientoEnum)
    type?: MovimientoEnum
}