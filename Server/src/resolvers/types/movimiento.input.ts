import { IsInt, IsPositive, isString, Max, Min } from "class-validator";
import { ArgsType, Field, Int } from "type-graphql";

@ArgsType()
export default class PaginationArgs {
  @IsInt()
  @Min(0)
  @Field(type => Int, {nullable: true})
  skip?: number = 0;

  @IsInt()
  @Min(0)
  @Field(type => Int, {nullable: true})
  take?: number = 10;
}

@ArgsType()
export class addMovesPastMonthArgs{
  @IsInt()
  @Min(2)
  @Field(type => Int)
  maxClients: number

  @IsInt()
  @Min(1)
  @Field(type => Int)
  minClients: number

  @IsInt()
  @Min(1)
  @Max(24)
  @Field(type => Int)
  timeShopOpen: number
  
  @IsInt()
  @Min(1)
  @Max(24)
  @Field(type => Int)
  timeShopClose: number

  @Field()
  sucursalId: string
}