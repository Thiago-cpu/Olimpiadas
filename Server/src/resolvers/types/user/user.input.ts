import { Field, InputType } from "type-graphql";

@InputType()
export class userInput{
    @Field()
    name: string
    @Field()
    password: string
}
