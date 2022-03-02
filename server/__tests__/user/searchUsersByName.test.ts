import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';

import server from '../../src/server';
import logger from '../../src/config/logger';
import authService from '../../src/service/auth.service';
import { UserReturn } from '../../src/model/user.model';

const BASE_URL = '/api/v1/user';
const AUTH_URL = '/api/v1/auth';

const app = server();
const fetch = supertest(app);

describe('Search Users By Name Unit Testing', () => {

    let user: UserReturn
    let tokens: { access_token: string, refresh_token: string }

    beforeAll(async () => {
        const NAMESPACE = 'BeforeAll';

        try {
            const mongo = await MongoMemoryServer.create();
            await mongoose.connect(mongo.getUri());

            await authService.register({
                country: 'ID',
                username: 'GetUser2',
                name: 'Get User 2',
                email: 'getUser2@gmail.com',
                password: 'getUser2@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser3',
                name: 'Get User 3',
                email: 'getUser3@gmail.com',
                password: 'getUser3@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser4',
                name: 'Get User 4',
                email: 'getUser4@gmail.com',
                password: 'getUser4@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

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

        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
        }
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })

    it('Should return some users with "user" keyword', async () => {
        const { body: { data }, statusCode } = await fetch.get(`${BASE_URL}/search?keyword=user`)
            .set('x-access-token', tokens.access_token)


        expect(statusCode).toBe(200)
        expect(data.user).toHaveLength(4)
        expect(data.nextURL).toBeNull()
        expect(data.page).toBe(1);

    })

    it('Should return some users with "get" keyword', async () => {
        const { body: { data }, statusCode } = await fetch.get(`${BASE_URL}/search?keyword=get`)
            .set('x-access-token', tokens.access_token)


        expect(statusCode).toBe(200)
        expect(data.user).toHaveLength(4)
        expect(data.nextURL).toBeNull()
        expect(data.page).toBe(1);

    })

})