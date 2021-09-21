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
import { execute, subscribe } from 'graphql';
import { ConnectionParams, SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';
import { validateToken } from './auth/isAuthenticated';
import cors from 'cors';

const PORT = 4000

export async function startServer(){
    const app = express();

    const httpServer = createServer(app);

    app.use(cookieParser())
    app.use(cors({
      origin: 'http://localhost:3000',
      credentials: true
    }))
    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jid;
        if (!token) {
          return res.send({ ok: false, accessToken: "" });
        }
    
        let payload: any = null;
        try {
          payload = verify(token, process.env.REFRESH_SECRET || 'dev');
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
    const schema =await buildSchema({
      resolvers: [__dirname + "/resolvers/**/*.resolver.{ts,js}"],
      dateScalarMode: "isoDate",
      authChecker
    })


    const apolloServer = new ApolloServer({
        schema,
        debug: process.env.mode !== 'production',
        context: ({ req, res }) => ({ req, res }),
        plugins: [{
          async serverWillStart() {
            return {
              async drainServer() {
                subscriptionServer.close();
              }
            };
          }
        }]
    })

    const subscriptionServer = SubscriptionServer.create(
      { schema, execute, subscribe,
      //   onConnect: async(connectionParams: ConnectionParams) => {
      //     if (connectionParams.Authorization) {
      //         const payload: any = await validateToken(connectionParams.Authorization)
      //         const user = await User.findOne(payload.id)
      //         if(!user){
      //           throw new Error('authToken incorrecto!')
      //         }
      //     }
   
      //     throw new Error('falta authToken!');
      //  }
      },
      { server: httpServer, path: apolloServer.graphqlPath},

      
    );

    await apolloServer.start();

    apolloServer.applyMiddleware({app, cors: false});

    app.listen(
        PORT,
        () => console.log(`Server started on http://localhost:${PORT}${apolloServer.graphqlPath}`),
    );
    const PORT2 = 4001;
    httpServer.listen(PORT2, () =>
      console.log(`wss is now running on http://localhost:${PORT2}/graphql`)
    );
}


