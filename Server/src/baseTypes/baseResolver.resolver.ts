import { ClassType, Resolver, Query, Arg, Int, Authorized, ObjectType, Field, Mutation } from 'type-graphql';
import { Role } from '../enums/role.enum';

export function createBaseResolver<X extends ClassType >(
    suffix: string,
    returnType: X,
    entity: any
    ) {
    
    @Resolver({ isAbstract: true })
    abstract class BaseResolver {
      @Authorized(Role.Admin)
      @Query(type => returnType, { name: `getAll${suffix}` })
      async getAll(){
        try{
            const result = await entity.find()
            console.log(result)
            return {data: result}
        }catch(err){
            return {errors: [{
                field: `getAll${suffix}`,
                message: "Error"
            }]}
        }
      }
      @Authorized(Role.Admin)
      @Mutation(type => Boolean, {name: `delete${suffix}`})
      async delete(@Arg('id') id: string){
        try{
            const result = await entity.delete(id)
            return result.affected
        }catch(err){
            return {
                errors: [{
                    field: `delete${suffix}`,
                    message: "Error"
                }]
            }
        }
      }
    }
    return BaseResolver 
}