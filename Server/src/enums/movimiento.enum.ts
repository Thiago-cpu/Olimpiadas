import { registerEnumType } from "type-graphql";

export enum MovimientoEnum {
    Ingreso = "Ingreso",
    Egreso = "Egreso"
}

registerEnumType(MovimientoEnum, {
  name: "MovimientoEnum"
});