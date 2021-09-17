import { ClassType, Resolver, Query, Arg, Int, Authorized, ObjectType, Field, Mutation } from 'type-graphql';
import { Role } from '../enums/role.enum';
import { newError } from '../utils/newError';
import { extractNullProps } from '../utils/extractNullProps';
import { hash } from 'bcrypt';
import { User } from '../entity/User';

export function createBaseResolver<X extends ClassType, Y extends ClassType >(
    suffix: string,
    updateType: Y,
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

      @Authorized(Role.Admin)
      @Mutation(()=>Boolean, {name: `update${suffix}`})
      async update(
          @Arg('id') id: string,
          @Arg('data', () => updateType) args: any
      ){
          try{
              const argsNotNull = extractNullProps(args)
              if(entity === User && argsNotNull.password){
                  const hashed = await hash(argsNotNull.password, 12)
                  argsNotNull.password = hashed
              }
              const result = await entity.update(id, argsNotNull)
              return result.affected
          }catch{
              return false
          }
      }
    }
    return BaseResolver 
}