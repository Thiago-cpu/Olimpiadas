import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import { sendRefreshToken } from './auth/sendRefreshToken';
import { createAuthToken, createRefreshToken } from './auth/createToken';
import cookieParser from 'cookie-parser';
import { authChecker } from './auth/authChecker';

const PORT = 4000

export async function startServer(){
    const app = express();
    app.use(cookieParser())
    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jid;
        if (!token) {
          return res.send({ ok: false, accessToken: "" });
        }
    
        let payload: any = null;
        try {
          payload = verify(token, process.env.REFRESH_SECRET!);
        } catch (err) {
          return res.send({ ok: false, accessToken: "" });
        }

        const user = await User.findOne({ id: payload.id });
    
        if (!user) {
          return res.send({ ok: false, accessToken: "" });
        }
    
        sendRefreshToken(res, createRefreshToken(user));
    
        return res.send({ ok: true, accessToken: createAuthToken(user) });
    });

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [__dirname + "/resolvers/**/*.resolver.{ts,js}"],
            dateScalarMode: "isoDate",
            authChecker
        }),
        debug: process.env.mode !== 'production',
        context: async({ req, res }) => {
            const authorization = req.headers["authorization"] 
            if(!authorization){
                return ({req, res})
            }
            try{
                const payload: any = verify(authorization.split(' ')[1], process.env.AUTH_SECRET!)
                console.log("hola")
                const user = await User.findOne({id: payload.id})
                if(!user){
                    return ({req, res})
                }
                payload.role = user.role
                return ({ req, res, payload })

            }catch(err){
                return ({req, res})
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


