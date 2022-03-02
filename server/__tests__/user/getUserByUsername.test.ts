import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';

import server from '../../src/server';
import logger from '../../src/config/logger';
import { UserReturn } from '../../src/model/user.model';
import authService from '../../src/service/auth.service';
import userService from '../../src/service/user.service';

const BASE_URL = '/api/v1/user';
const AUTH_URL = '/api/v1/auth';

const app = server();
const fetch = supertest(app);

describe('getUser Unit Testing', () => {

    let user: UserReturn
    let tokens: { access_token: string, refresh_token: string }

    beforeAll(async () => {
        const NAMESPACE = 'BeforeAll';

        try {
            const mongo = await MongoMemoryServer.create();
            await mongoose.connect(mongo.getUri());

            // Create admin user
            user = await authService.register({
                username: 'getUser',
                email: 'getUser@gmail.com',
                password: 'getUser@gmail.com',
                name: 'Get Current User',
                type: 'admin',
                country: 'ID',
                isGoogleAccount: false
            })

            // Get the user logged in
            const { statusCode, body: { data } } = await fetch.post(AUTH_URL).send({ email: user.email, password: 'getUser@gmail.com' });

            expect(statusCode).toBe(200);
            expect(data).not.toBeNull();

            tokens = {
                access_token: data.accessToken,
                refresh_token: data.refreshToken
            }

            user = data

        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
        }
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })


    it('Should return status code 406 for invalid request and null data because the user is not an admin', async () => {
        // Login the user to get accessToken
        const { body: { data: resLoginData } } = await fetch.post(AUTH_URL).send({
            email: 'getUser@gmail.com',
            password: 'getUser@gmail.com'
        })

        const { body: { data }, statusCode } = await fetch.get(`${BASE_URL}/users`).set('x-access-token', resLoginData.accessToken);
        expect(statusCode).toBe(406);
        expect(data).toBeNull();
    })

    // Find a user using query!
    it('Should return status code 200 and some users information', async () => {

        const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}/${user.username}/one`)
            .set('x-access-token', tokens.access_token)
            .set('x-refresh-token', tokens.refresh_token)


        expect(statusCode).toBe(200);
        expect(data._id.toString()).toBe(user._id.toString());
        expect(data.username).toBe(user.username);
    })

})