import { registerEnumType } from "type-graphql";

export enum Role {
    Admin = "Admin",
    Encargado = "Encargado"
}

registerEnumType(Role, {
  name: "Role"
});