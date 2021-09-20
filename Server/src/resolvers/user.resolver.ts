import { Arg, Field, Mutation, ObjectType, Query, Resolver, ID, Ctx, Authorized } from 'type-graphql';
import { User } from '../entity/User';
import { partialUserInput, userInput, adminPartialUserInput } from './types/user.input';
import { compare, hash } from "bcrypt";
import { createAuthToken, createRefreshToken } from '../auth/createToken';
import { MyContext } from '../utils/context.interface';
import { baseResponse } from '../baseTypes/baseResponse.response';
import { sendRefreshToken } from '../auth/sendRefreshToken';
import { createBaseResolver } from '../baseTypes/baseResolver.resolver';
import { newError } from '../utils/newError';
import { extractNullProps } from '../utils/extractNullProps';
import { Role } from '../enums/role.enum';

@ObjectType()
class LoginResponse extends baseResponse{
    @Field(() => String, {nullable: true})
    authToken?: String

    @Field(() => User, {nullable: true})
    data?: User
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
    adminPartialUserInput,
    UsersResponse,
    User
)


@Resolver()
export class UserResolver extends UserBaseResolver{
    @Authorized()
    @Query(() => UserResponse)
    async me(@Ctx() {payload}: MyContext){
        try{
            const {id} = payload!
            const user = await User.findOne(id,{relations: ["sucursales"]})
            return {data: user}
        }catch(err){
            return newError("getMySucursales", "Error")
        }
    }
    @Mutation(() => UserResponse)
    async register(@Arg("data") userData: userInput){
        try{
            const userExists = await User.findOne({name: userData.name})
            if(userExists){
                return newError("Form", "El nombre ya está en uso")
            }
            const user = await User.create(userData).save()
            return {data: user}
        }catch(err){
            return newError("Form", "No se ha podido encontrar el usuario")
        }
    }
    @Mutation(()=> LoginResponse)
    async login(@Arg("data") userData: userInput, @Ctx() {res}: MyContext){
        const {name} = userData
        const user = await User.findOne({name})
        if(!user){
            return newError("Form", "Las credenciales no coinciden")
        }
        const isCorrectPassword = await compare(userData.password, user.password)
        if(!isCorrectPassword){
            return newError("Form", "Las credenciales no coinciden")
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
    async deleteMe(@Ctx() {res, payload}: MyContext){
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
    async updateMe(
        @Ctx() {payload}: MyContext,
        @Arg('data') args: partialUserInput,
        ){
        try{
            const argsNotNull = extractNullProps(args)
            if(argsNotNull.password){
                const hashed = await hash(argsNotNull.password, 12)
                argsNotNull.password = hashed
            }
            const {id} = payload!
            const result = await User.update(id, argsNotNull)
            return result.affected
        }catch(err){
            return false
        }
    }

    @Authorized(Role.Admin)
    @Mutation(() => UserResponse)
    async changeRole(
        @Arg('userId') userId: string,
        @Arg('role') role: Role
    ){
        try {
            const userExist = await User.findOneOrFail(userId)
            userExist.role = role
            const result = await userExist.save()
            return {data: result}
        } catch (error) {
            return newError("ChangeRole", "no se pudo cambiar el Rol del usuario")
        }
    }
}