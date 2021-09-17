import { Arg, Field, Mutation, ObjectType, Query, Resolver, ID, Ctx, Authorized } from 'type-graphql';
import { User } from '../entity/User';
import { partialUserInput, userInput } from "./types/user.input";
import { compare, hash } from "bcrypt";
import { createAuthToken, createRefreshToken } from '../auth/createToken';
import { MyContext } from '../utils/context.interface';
import { baseResponse } from '../baseTypes/baseResponse.response';
import { sendRefreshToken } from '../auth/sendRefreshToken';
import { createBaseResolver } from '../baseTypes/baseResolver.resolver';
import { SucursalesResponse } from './sucursal.resolver';

@ObjectType()
class LoginResponse extends baseResponse{
    @Field()
    authToken: String

    @Field(() => User)
    user: User
}

@ObjectType()
class UserResponse extends baseResponse {
  @Field(() => User, { nullable: true })
  data?: User;
}

@ObjectType()
class UsersResponse extends baseResponse {
  @Field(() => [User], { nullable: true })
  data?: User[];
}

const UserBaseResolver = createBaseResolver(
    "User",
    UsersResponse,
    User
)


@Resolver()
export class UserResolver extends UserBaseResolver{
    @Authorized()
    @Query(() => UserResponse)
    async getMyUser(@Ctx() {payload}: MyContext){
        try {
            const user = await User.findOne(payload!.id)
            return {data: user}
        } catch (error) {
            return {
                errors: [{
                    field: "GetMyInfo",
                    message: "Error"
                }]
            }
        }
    }
    @Authorized()
    @Query(() => SucursalesResponse)
    async getMySucursales(@Ctx() {payload}: MyContext) {
        try{
            const {id} = payload!
            const user = await User.findOne(id,{relations: ["sucursales"]})
            return {data: user?.sucursales}
        }catch(err){
            return {
                errors: [{
                    field: "getMySucursales",
                    message: "Error"
                }]
            }
        }

    }
    @Mutation(() => UserResponse)
    async register(@Arg("data") userData: userInput){
        try{
            const userExists = await User.findOne({name: userData.name})
            if(userExists){
                return {
                    errors: [{
                        field: "Form",
                        message: "El nombre ya está en uso"
                       }]
                }
            }
            const user = await User.create(userData).save()
            return {data: user}
        }catch(err){
            return {
                errors: [{
                    field: "Form",
                    message: "No se ha podido crear el usuario"
                   }]
            }
        }
    }
    @Mutation(()=> LoginResponse)
    async login(@Arg("data") userData: userInput, @Ctx() {res}: MyContext){
        const {name} = userData
        const user = await User.findOne({name})
        if(!user){
            return {
                errors: [{
                    field: "form_login",
                    message: "Las credenciales no coinciden"
                   }]
            }
        }
        const isCorrectPassword = await compare(userData.password, user.password)
        if(!isCorrectPassword){
            return {
                errors: [{
                    field: "form_login",
                    message: "Las credenciales no coinciden"
                   }]
            }
        }
        sendRefreshToken(res, createRefreshToken(user));

        return {
            authToken: createAuthToken(user),
            user
        }
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext) {
      sendRefreshToken(res, "");
      return true;
    }

    @Authorized()
    @Mutation(() => Boolean)
    async deleteMyUser(@Ctx() {res, payload}: MyContext){
        sendRefreshToken(res, "");
        try {
            const result = await User.delete(payload!.id)
            return result.affected
        }catch(err){
            return false
        }
    }

    @Authorized()
    @Mutation(()=> Boolean)
    async updateMyUser(
        @Ctx() {payload}: MyContext,
        @Arg('data') args: partialUserInput,
        ){
        try{
            const {id} = payload!
            const userExists = await User.findOne(id)
            if(!userExists){
                return false
            }
            const result = await User.update(id, {...args})
            return result.affected
        }catch(err){
            return false
        }
    }
}