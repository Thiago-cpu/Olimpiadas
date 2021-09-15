import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';
import { Movimiento } from './entity/Movimiento';
import { MovimientoEnum } from './enums/movimiento.enum';


const PORT = 4000

export async function startServer(){
    const app = express();

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [__dirname + "/resolvers/**/*.resolver.{ts,js}"],
            dateScalarMode: "isoDate"
        }),
        debug: process.env.mode !== 'production',
        context: ({req}) => {
            const token = req.headers['authorization'] || '';
            if(token){
                try {
                    const user = verify(token.split(' ')[1], process.env.AUTH_SECRET!)
                    return{
                        user
                    }
                } catch (error) {
                    return {
                        user: null
                    }
                }
            }
        }
    })

    await apolloServer.start();

    apolloServer.applyMiddleware({app})

    app.listen(
        PORT,
        () => console.log(`Server started on http://localhost:${PORT}${apolloServer.graphqlPath}`),
    );
}


