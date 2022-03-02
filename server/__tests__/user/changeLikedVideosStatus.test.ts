import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';

import server from '../../src/server';
import logger from '../../src/config/logger';
import { ShowLikedVideos, UserReturn } from '../../src/model/user.model';
import authService from '../../src/service/auth.service';

const BASE_URL = '/api/v1/user';
const AUTH_URL = '/api/v1/auth';

const app = server();
const fetch = supertest(app);

describe('Change Liked Video Status Unit Testing', () => {

    let user: UserReturn
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
     * 2. Failed request cause empty body
     * 3. Success request
     */

    describe('Failed request cause no access_token', () => {

        it('Should return error message and status code 401', async () => {

            const { statusCode, body: { error, data } } = await fetch.patch(`${BASE_URL}/liked_video_status`);

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    describe('Failed request cause empty body', () => {

        it('Should return error message and status code 406', async () => {

            const { statusCode, body: { error } } = await fetch.patch(`${BASE_URL}/liked_video_status`).send({})
                .set('x-access-token', tokens.access_token).set('x-refresh-token', tokens.refresh_token);


            expect(statusCode).toBe(406);
            expect(error).toEqual([
                {
                    "field": "newPrivacyStatus",
                    "message": "Invalid enum value. Expected 'true' | 'false', received undefined"
                }
            ]);
        })

    })

    describe('Success request', () => {

        it('Should return new LikedVideos Privacy', async () => {

            const newPrivacyStatus: ShowLikedVideos = 'false';

            const { statusCode, body: { data } } = await fetch.patch(`${BASE_URL}/liked_video_status`).send({ newPrivacyStatus })
                .set('x-access-token', tokens.access_token).set('x-refresh-token', tokens.refresh_token);


            expect(statusCode).toBe(200);
            expect(data.showLikedVideos).toBe(newPrivacyStatus);

        })

    })

})