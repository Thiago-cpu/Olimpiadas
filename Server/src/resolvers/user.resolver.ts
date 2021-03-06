import { Arg, Field, Mutation, ObjectType, Query, Resolver, ID, Ctx, Authorized } from 'type-graphql';
import { User } from '../entity/User';
import { updateUserInput, userInput, changeRoleInput } from './types/user.input';
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
    UsersResponse,
    User
)


@Resolver()
export class UserResolver extends UserBaseResolver{
    @Authorized()
    @Query(() => UserResponse)
    async me(@Ctx() {payload}: MyContext): Promise<UserResponse>{
        try{
            const {id} = payload!
            const user = await User.findOne(id,{relations: ["sucursales"]})
            return {data: user}
        }catch(err){
            return newError("getMySucursales", "Error")
        }
    }
    @Mutation(() => UserResponse)
    async register(@Arg("data") userData: userInput): Promise<UserResponse>{
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
    async login(@Arg("data") userData: userInput, @Ctx() {res}: MyContext): Promise<LoginResponse>{
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
            data: user
        }
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext): Promise<Boolean> {
      sendRefreshToken(res, "");
      return true;
    }

    @Authorized()
    @Mutation(() => Boolean)
    async deleteMe(@Ctx() {res, payload}: MyContext): Promise<Boolean>{
        sendRefreshToken(res, "");
        try {
            const result = await User.delete(payload!.id)
            return !!result.affected
        }catch(err){
            return false
        }
    }

    @Authorized()
    @Mutation(()=> UserResponse)
    async updateMe(
        @Ctx() {payload}: MyContext,
        @Arg('data') args: updateUserInput,
        ): Promise<UserResponse>{
        try{
            const argsNotNull: updateUserInput = extractNullProps(args)
            if(argsNotNull.name){
                const userExists = await User.findOne({name: argsNotNull.name})
                if(userExists){
                    return newError("Ya existe un usuario con ese nombre")
                }
            }
            if(argsNotNull.password){
                const hashed = await hash(argsNotNull.password, 12)
                argsNotNull.password = hashed
            }
            const {id} = payload!
            const result = await User.update(id, argsNotNull)
            if(!result.affected){
                return newError("No se pudo actualizar el usuario")
            }
            const userUpdated = await User.findOneOrFail(id)
            return {data: userUpdated}
        }catch(err){
            return newError("Algo ha salido mal al actualizar el usuario")
        }
    }

    @Authorized(Role.Admin)
    @Mutation(() => UserResponse)
    async changeRole(
        @Arg('data') args: changeRoleInput
    ): Promise<UserResponse>{
        try {
            const {userId, role} = args
            const userExist = await User.findOneOrFail(userId)
            userExist.role = role
            const result = await userExist.save()
            return {data: result}
        } catch (error) {
            return newError("ChangeRole", "no se pudo cambiar el Rol del usuario")
        }
    }
}