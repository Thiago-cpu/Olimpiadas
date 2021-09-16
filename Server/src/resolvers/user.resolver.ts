import { Arg, Field, Mutation, ObjectType, Query, Resolver, ID, Ctx, Authorized } from 'type-graphql';
import { User } from '../entity/User';
import { userInput } from "./types/user.input";
import { compare, hash } from "bcrypt";
import { createAuthToken } from '../utils/auth';
import { MyContext } from '../utils/context.interface';
import { FieldError } from './types/fieldError.error';
import { Sucursal } from '../entity/Sucursal';

@ObjectType()
class LoginResponse{
    @Field()
    authToken: String

    @Field(() => User)
    user: User
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver{

    @Query(() => [User])
    // @Authorized('admin')
    async users(@Ctx() ctx: MyContext) {
        return await User.find()
    }
    @Query(() => [Sucursal])
    // @Authorized('admin')
    async getSucursalesOfUser(@Arg("data") userId: String) {
        const user = await User.findOne({relations: ["sucursales"], where:{id: userId}})
        return user?.sucursales
    }

    // @Authorized('admin')
    @Mutation(()=> Boolean)
    async deleteUser(@Arg("data") userId: String){
        const user = await User.findOne({where:{id:userId}})
        if(user){
            await user.remove()
            return true
        }
        return false
    }

    @Mutation(() => UserResponse)
    async register(@Arg("data") userData: userInput){
        try{
            const {password} = userData
            const hashPassword = await hash(password, 12)
            const user = await User.create({
                name: userData.name,
                password: hashPassword
            }).save()
            return {user}

        }catch(err){
            return {
                errors: [{
                    field: "name",
                    message: "register failed"
                   }]
            }
        }
    }
    @Query(()=> LoginResponse)
    async login(@Arg("data") userData: userInput){
        const {name} = userData
        const user = await User.findOne({name})
        if(!user){
            return {
                errors: [{
                    field: "all",
                    message: "Las credenciales no coinciden"
                   }]
            }
        }
        const isCorrectPassword = await compare(userData.password, user.password)
        if(!isCorrectPassword){
            return {
                errors: [{
                    field: "all",
                    message: "Las credenciales no coinciden"
                   }]
            }
        }
        const authToken = createAuthToken(user)
        
        return {
            authToken,
            user
        }
    }
}