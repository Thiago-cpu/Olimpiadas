import { Length, maxLength } from "class-validator";
import { Field, InputType, Int } from "type-graphql";

@InputType()
export class sucursalInput{
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
