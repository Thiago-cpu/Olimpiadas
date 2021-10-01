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
import cors from 'cors';

//Aguante heroku

const PORT = 4000

export async function startServer(){
    const app = express();

    const httpServer = createServer(app);

    app.use(cookieParser())
    app.use(cors())
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
      { schema, execute, subscribe },
      { server: httpServer, path: apolloServer.graphqlPath },

      
    );

    await apolloServer.start();

    apolloServer.applyMiddleware({app, cors: false});

    httpServer.listen(PORT, () =>
      console.log(`the server is now running on http://localhost:${PORT}/graphql`)
    );
}


