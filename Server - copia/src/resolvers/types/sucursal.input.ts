import { IsOptional, IsPositive, isPositive, Length, maxLength } from "class-validator";
import { Field, InputType, Int } from "type-graphql";
import { Sucursal } from '../../entity/Sucursal';

@InputType()
export class sucursalInput implements Partial<Sucursal>{
    @Length(3,30)
    @Field()
    name: string
    
    @IsPositive()
    @Field(() => Int)
    capacidadMaxima: number

    @Length(10,255)
    @Field()
    localizacion: string

    @Field()
    encargadoId: string
}
@InputType()
export class updateSucursalInput implements Partial<sucursalInput>{
    @Length(3,30)
    @Field({nullable: true})
    name?: string

    @IsPositive()
    @Field(() => Int, {nullable: true})
    capacidadMaxima?: number

    @Length(3,255)
    @Field({nullable: true})
    localizacion?: string
}
@InputType()
export class adminPartialSucursalInput extends updateSucursalInput{
    @Field({nullable: true})
    encargado?: string
}
