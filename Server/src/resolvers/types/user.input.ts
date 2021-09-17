import { Length, ValidateIf } from "class-validator";
import { Field, InputType } from "type-graphql";
import { User } from '../../entity/User';
import { Role } from '../../enums/role.enum';

@InputType()
export class userInput implements Partial<User>{
    @Length(1,15)
    @Field()
    name: string
    @Length(1,12)
    @Field()
    password: string
}

@InputType()
export class partialUserInput implements Partial<userInput>{

    @Length(1,15)
    @Field({nullable: true})
    name?: string

    @Length(1,12)
    @Field({nullable: true})
    password?: string
}

@InputType()
export class adminPartialUserInput extends partialUserInput{

    @Field(()=>Role, {nullable: true})
    role?: Role
}

