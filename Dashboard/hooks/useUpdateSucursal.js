import { useMutation } from "@apollo/client";
import { useFormik } from "formik"
import { useContext } from "react";
import * as Yup from 'yup'
import AlertContext from "../context/alertContext";
import { UPDATE_SUCURSAL } from "../gql/mutations/updateSucursal";

export default function useUpdateSucursal(sucursal, onSuccess = () => {}){
  const { setAlert } = useContext(AlertContext);
  const [updateSucursal] = useMutation(UPDATE_SUCURSAL, {
    variables: {
      updateMySucursalSucursalId: sucursal.id
    }
  });
  const formik = useFormik({
    initialValues: {
      name: sucursal.name,
      capacidadMaxima: sucursal.capacidadMaxima,
      localizacion: sucursal.localizacion
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(30, "Máximo 30 caracteres"),
      capacidadMaxima: Yup.number()
        .required("Requerido")
        .positive("Debería de ser un numero postivo")
        .integer("Debería de ser un entero"),
      localizacion: Yup.string()
        .required("Requerido")
        .min(10, "Mínimo 10 caracteres")
        .max(255, "Máximo 255 caracteres"),
    }),
    onSubmit: async (values) => {
      try{
          const { data } = await updateSucursal({
              variables: {
                updateMySucursalData: {
                      ...values
                  },
              },
          })
          const {updateMySucursal} = data
          const {errors, data:sucursal} = updateMySucursal
          if(errors){
            setAlert({
              severity: "error",
              text: errors[0].message
            })
          } else {
            setAlert({
              severity: "success",
              text: `La sucursal ${sucursal.name} fue actualizada correctamente`
            })
            onSuccess(sucursal)
          }
      }
      catch(e){
          console.log(e)
      }
    }
  })
  return formik
}