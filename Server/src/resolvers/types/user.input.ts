import { Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class userInput{
    @Length(1,15)
    @Field()
    name: string
    @Length(1,12)
    @Field()
    password: string
}
