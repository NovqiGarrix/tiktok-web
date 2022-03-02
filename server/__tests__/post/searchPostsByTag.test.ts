import supertest from "supertest";
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import server from '../../src/server';
import logger from "../../src/config/logger";
import authService from "../../src/service/auth.service";
import { UserReturn } from "../../src/model/user.model";
import { IPost, PostPrivacy } from "../../src/model/posts.model";
import postsService from "../../src/service/posts.service";
import userService from "../../src/service/user.service";
import { encodeBase64 } from "../../src/util/base64";

const BASE_URL = '/api/v1/post';
const AUTH_URL = '/api/v1/auth';
const app = server();
const fetch = supertest(app);

describe('Search Posts by Name Test', () => {

    let user: UserReturn
    let post: IPost
    let tokens: { access_token: string, refresh_token: string }

    beforeAll(async () => {
        const NAMESPACE = 'BeforeAll'

        try {

            const mongodb = await MongoMemoryServer.create();
            await mongoose.connect(mongodb.getUri());

            // Register a new user
            const newUser = await authService.register({
                username: "uploadTest",
                name: "Upload Post Unit Testing",
                email: "uploadPost@gmail.com",
                password: "uploadTest",
                country: "ID",
                type: 'user',
                isGoogleAccount: false
            })

            expect(newUser).not.toBeNull();
            user = newUser;

            // Login the user to get access_token and refresh_token
            const { body: { data: loginData } } = await fetch.post(AUTH_URL).send({
                email: newUser.email,
                password: 'uploadTest'
            })

            tokens = {
                access_token: loginData.accessToken,
                refresh_token: loginData.refreshToken
            }

            // Create a new post to delete
            const fileId = '1_iwXSgI70MbIna0_6GIiZsz7vEBGJF3W';
            const desc = 'Marry Christmas Everybody #marry #christmas'
            const country = 'ID'
            const privacy: PostPrivacy = 'public';
            const userId = user._id

            post = await postsService.uploadPost(userId, { fileId, desc, country, privacy, title: 'My #first Cool Video' });
            expect(post).toBeTruthy();

            await postsService.uploadPost(userId, { fileId, desc: 'Second Video', country, privacy, title: 'My Second Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: 'Third Video', country, privacy, title: 'My Third Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: 'Fourth Video', country: 'EN', privacy, title: 'My 4th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: 'Sixth Video', country, privacy: 'friends', title: 'My 5th Cool Video' });

        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
        }
    })

    afterAll(async () => {
        const NAMESPACE = 'AfterAll'

        try {
            await mongoose.connection.close();
            await mongoose.disconnect();
        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
        }
    })


    describe('Failed request for no access_token', () => {

        it('Should return error message and status code 401', async () => {

            const { statusCode, body: { error, data } } = await fetch.post(`${BASE_URL}/${post._id}/like`);

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    describe('Success request', () => {

        it('Should return some posts with "#first"', async () => {

            const tag = encodeBase64('#first'); // Should encode, to remove the '#' from URI

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}/search/tag?tag=${tag}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.result).toHaveLength(1);
            expect(data.nextURL).toBeNull()
            expect(data.page).toBe(1);

        })

        it('Should return some posts with "#christmas"', async () => {

            const tag = encodeBase64('#christmas'); // Should encode, to remove the '#' from URI

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}/search/tag?tag=${tag}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.result).toHaveLength(1);
            expect(data.nextURL).toBeNull()
            expect(data.page).toBe(1);

        })

    })

})