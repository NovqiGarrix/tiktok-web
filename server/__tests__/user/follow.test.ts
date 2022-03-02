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

describe('Follow Unit Testing', () => {

    let user: UserReturn
    let user2: UserReturn
    let tokens: { access_token: string, refresh_token: string }

    beforeAll(async () => {
        const NAMESPACE = 'BeforeAll';

        try {
            const mongo = await MongoMemoryServer.create();
            await mongoose.connect(mongo.getUri());

            // Register new user
            const newUser = await authService.register({
                username: "followTest",
                name: "Follow Unit Testing",
                email: "follow@gmail.com",
                password: "followTest",
                country: "ID",
                type: "user",
                isGoogleAccount: false
            })

            user2 = await authService.register({
                username: "followTest2",
                name: "Follow Unit Testing 2",
                email: "follow2@gmail.com",
                password: "followTest2",
                country: "ID",
                type: "user",
                isGoogleAccount: false
            })

            // Login the new user to get access_token and refresh_token
            const { statusCode, body: { data } } = await fetch.post(AUTH_URL).send({ email: newUser.email, password: "followTest" });

            expect(statusCode).toBe(200);
            user = data
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

    /**
     * Test Cases
     * 1. Failed request cause no access_token
     * 2. Failed request cause empty req.body
     * 3. Failed request cause whoId is an invalid Id
     * 4. Success request
     */

    describe('Failed request cause no access_token', () => {

        it('Should return error message and status code 401', async () => {

            const { statusCode, body: { error, data } } = await fetch.get(`${BASE_URL}/`);

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    describe('Failed request cause whoId is an invalid Id', () => {

        it('Should return error message, and status code 404', async () => {

            const whoId = new mongoose.Types.ObjectId().toString();

            const { statusCode, body: { error } } = await fetch.post(`${BASE_URL}/${whoId}/follow`)
                .set('x-access-token', tokens.access_token).set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(404);
            expect(error).toBe('Invalid request!')

        })

    })

    let updatedUser: any;

    describe('Success request', () => {

        it('Should return back user with following was added', async () => {

            const { statusCode, body: { data } } = await fetch.post(`${BASE_URL}/${user2._id}/follow`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.following).toHaveLength(1);

            updatedUser = data

        })

        it('Should have standart following method', async () => {

            const updatedUser2 = await userService.findById(user2._id);
            if (!updatedUser2) return;

            expect(updatedUser.following[0].userId.toString()).toBe(updatedUser2._id.toString());
            expect(updatedUser2.followers[0].toString()).toBe(updatedUser._id.toString());

        })

    })

})