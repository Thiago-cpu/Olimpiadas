import  Router  from 'next/router';
import { destroyCookie, setCookie } from 'nookies';
import { createContext, useEffect, useState } from "react";
import {initializeApollo} from '../lib/apolloClient'

interface UserInterface {
    isLogged: boolean,
    name: string,
    role: string,
}

  
export type userContextInterface = {
    user: UserInterface
    setUser: (u: UserInterface) => void
    logout:()=>void
}
const UserContext = createContext<userContextInterface>({
    user: {
        isLogged: false,
        name: "",
        role: "",
    },
    setUser: ()=>{},
    logout:()=>{}
})

export function UserContextProvider({children}){
    const defaultValues = {
        isLogged: false,
        name: "",
        role: ""
    }
    const [user, setUser] = useState<UserInterface>(defaultValues)

    const props = ['isLogged', 'name', 'role']
    const logout = () => {
        setUser(defaultValues)
        props.forEach(prop=>{
            localStorage.removeItem(prop)
        })
        Router.push('/login')
        destroyCookie(null, 'token')
        initializeApollo().cache.reset()
    }

    useEffect(()=>{
        setUser({
            isLogged: !!localStorage.getItem('isLogged'),
            name: localStorage.getItem('name'),
            role: localStorage.getItem('role'),
        })
    },[])

    useEffect(() =>{
        localStorage.setItem('isLogged', user.isLogged?"1":"")
        localStorage.setItem('name', user.name)
        localStorage.setItem('role', user.role)
    },[user])

    return <UserContext.Provider value={{user, setUser, logout}}>
        {children}
    </UserContext.Provider>
}

export default UserContext