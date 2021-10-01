import {
  Arg,
  Mutation,
  Resolver,
  ObjectType,
  Field,
  Authorized,
  Query,
  Ctx,
  Args,
  createMethodDecorator,
} from "type-graphql";
import { Sucursal } from "../entity/Sucursal";
import {
  sucursalInput,
  adminPartialSucursalInput,
  updateSucursalInput,
} from "./types/sucursal.input";
import { User } from "../entity/User";
import { Role } from "../enums/role.enum";
import { createBaseResolver } from "../baseTypes/baseResolver.resolver";
import { baseResponse } from "../baseTypes/baseResponse.response";
import { newError } from "../utils/newError";
import { extractNullProps } from "../utils/extractNullProps";
import { MyContext } from "../utils/context.interface";
import { isMySucursal } from "../decorators/isMySucursal";

@ObjectType()
class SucursalResponse extends baseResponse {
  @Field(() => Sucursal, { nullable: true })
  data?: Sucursal;
}

@ObjectType()
class SucursalesResponse extends baseResponse {
  @Field(() => [Sucursal], { nullable: true })
  data?: Sucursal[];
}
const SucursalBaseResolver = createBaseResolver(
  "Sucursal",
  SucursalesResponse,
  Sucursal
);
@Resolver()
export class SucursalResolver extends SucursalBaseResolver {
  @Query((type) => SucursalesResponse)
  async sucursales() {
    try {
      const result = await Sucursal.find({relations: ["encargado"]});
      return { data: result };
    } catch (err) {
      return newError(`Sucursales`, "Error");
    }
  }

  @Authorized(Role.Admin)
  @Query(() => SucursalesResponse)
  async getSucursalesOfUser(
    @Arg("userId") userId: string
  ): Promise<SucursalesResponse> {
    try {
      const user = await User.findOne(userId, { relations: ["sucursales"] });
      if (!user) {
        return newError("getSucursalesOfUser", "Usuario no encontrado");
      }
      const sucursales = user.sucursales;
      return { data: sucursales };
    } catch (err) {
      return newError(
        "getSucursalesOfUser",
        "Algo ha salido mal al intentar recuperar las sucursales del usuario"
      );
    }
  }

  @Authorized(Role.Admin)
  @Mutation(() => SucursalResponse)
  async addSucursal(
    @Arg("data") sucursalData: sucursalInput
  ): Promise<SucursalResponse> {
    try {
      const encargado = await User.findOne(sucursalData.encargadoId);
      if (!encargado) {
        return newError("Form", "Usuario no encontrado");
      }
      const issetSucursal = await Sucursal.findOne({
        where: { name: sucursalData.name, encargado: sucursalData.encargadoId },
      });
      if (issetSucursal) {
        return newError(
          "Form",
          "El usuario ya tiene una sucursal con ese nombre"
        );
      }
      const sucursal = await Sucursal.create({
        ...sucursalData,
        encargado,
      }).save();
      return { data: sucursal };
    } catch (err) {
      return newError("Form", "Algo ha salido mal al crear la sucursal");
    }
  }

  @Authorized()
  @isMySucursal()
  @Mutation(() => SucursalResponse)
  async updateMySucursal(
    @Arg("data") args: updateSucursalInput,
    @Arg("sucursalId") sucursalId: string,
    @Ctx() { payload }: MyContext
  ): Promise<SucursalResponse> {
    try {
      const argsNotNull: updateSucursalInput = extractNullProps(args);
      if (argsNotNull.name) {
        const alreadyHas = await Sucursal.findOne({
          where: { name: argsNotNull.name, encargado: payload!.id },
        });
        if (alreadyHas && alreadyHas.id !== sucursalId) {
          return newError(
            "updateMySucursal",
            "Ya tienes una sucursal con ese nombre"
          );
        }
      }
      const result = await Sucursal.update(sucursalId, argsNotNull);
      if (!result.affected) {
        return newError(
          "updateMySucursal",
          "algo ha salido mal al actualizar la sucursal"
        );
      }
      const newSucursal = await Sucursal.findOneOrFail(sucursalId);
      return { data: newSucursal };
    } catch (err) {
      return newError("updateMySucursal", "algo ha salido mal");
    }
  }

  @Authorized(Role.Admin)
  @Mutation(() => SucursalResponse)
  async changeEncargado(
    @Arg("userId") userId: string,
    @Arg("sucursalId") sucursalId: string
  ): Promise<SucursalResponse> {
    const sucursalExists = await Sucursal.findOne(sucursalId);
    if (!sucursalExists) {
      return newError("changeEncargado", "No se ha encontrado la sucursal");
    }
    const userExists = await User.findOne(userId);
    if (!userExists) {
      return newError("changeEncargado", "No se ha encontrado el usuario");
    }
    sucursalExists.encargado = userExists;
    const result = await sucursalExists.save();
    return { data: result };
  }
}
