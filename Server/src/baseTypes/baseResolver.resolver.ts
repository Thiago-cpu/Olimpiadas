import { ClassType, Resolver, Query, Arg, Int, Authorized, ObjectType, Field, Mutation } from 'type-graphql';
import { Role } from '../enums/role.enum';
import { newError } from '../utils/newError';

export function createBaseResolver<X extends ClassType >(
    suffix: string,
    returnType: X,
    entity: any
    ) {
    
    @Resolver({ isAbstract: true })
    abstract class BaseResolver {
      @Authorized(Role.Admin)
      @Query(type => returnType, { name: `all${suffix}` })
      async getAll(){
        try{
            const result = await entity.find()
            return {data: result}
        }catch(err){
            return newError(`getAll${suffix}`, "Error")
        }
      }
      @Authorized(Role.Admin)
      @Mutation(type => Boolean, {name: `delete${suffix}`})
      async delete(@Arg('id') id: string){
        try{
            const result = await entity.delete(id)
            return result.affected
        }catch(err){
            return newError(`delete${suffix}`, "Error")
        }
      }
    }
    return BaseResolver 
}