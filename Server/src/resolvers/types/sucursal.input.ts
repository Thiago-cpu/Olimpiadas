import { IsOptional, Length, maxLength } from "class-validator";
import { Parser } from "graphql/language/parser";
import { Field, InputType, Int } from "type-graphql";
import { Sucursal } from '../../entity/Sucursal';

@InputType()
export class sucursalInput implements Partial<Sucursal>{
    @Length(3,20)
    @Field()
    name: string
    
    @Field(() => Int)
    capacidadMaxima: number

    @Length(3,255)
    @Field()
    localizacion: string

    @Field()
    encargadoId: string
}
