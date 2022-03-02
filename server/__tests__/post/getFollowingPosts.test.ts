import supertest from "supertest";
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import server from '../../src/server';
import logger from "../../src/config/logger";
import authService from "../../src/service/auth.service";
import { UserReturn } from "../../src/model/user.model";
import { IPost, PostPrivacy } from "../../src/model/posts.model";
import postsService from "../../src/service/posts.service";
import { UserAndPost } from "../../src/controller/posts.controller";

const BASE_URL = '/api/v1/post';
const AUTH_URL = '/api/v1/auth';
const USER_URL = '/api/v1/user';
const app = server();
const fetch = supertest(app);

describe('Get Following Post Route Test', () => {

    let user: UserReturn
    let post: IPost
    let tokens: { access_token: string, refresh_token: string }

    let userPostsLength: number

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

            // Create a new post
            const fileId = '1_iwXSgI70MbIna0_6GIiZsz7vEBGJF3W';
            const desc = 'Video Test'
            const country = 'ID'
            const privacy: PostPrivacy = 'public';
            const userId = user._id

            post = await postsService.uploadPost(userId, { fileId, desc, country, privacy, title: 'Video for testing purposes only' });
            await postsService.uploadPost(userId, { fileId, desc: 'No desc yet!', country: 'EN', privacy, title: 'How to be a great software engineering?' })
            expect(post._id.toString()).toStrictEqual(expect.any(String));


            // Expecting the user posts is 2
            userPostsLength = (await postsService.getPosts({ userId }, 100, 0)).length
            expect(userPostsLength).toBe(2);

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

    /**
     * TEST CASEs
     * 1. Failed request for no access_token
     * 2. Failed request cause the user does not own the post
     * 3. Sucess
     */

    describe('Failed request for no access_token', () => {

        it('Should return error message and status code 401', async () => {

            const { statusCode, body: { error, data } } = await fetch.patch(`${BASE_URL}/${user._id}/follow`);

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    let followingPosts: Array<UserAndPost>

    describe('Success request', () => {

        it('Should return a lists of post', async () => {

            // Create a new user
            const newUser = await authService.register({
                name: "Get Following Post User",
                username: 'getFollowingPosts',
                type: "user",
                country: "ID",
                email: "getFollowingPosts@gmail.com",
                password: "getFollowingPosts",
                isGoogleAccount: false
            })

            // Login the user to get access_token and refresh_token
            const { body: { data: loginData }, statusCode: loginStatusCode } = await fetch.post(AUTH_URL).send({
                email: newUser.email,
                password: 'getFollowingPosts'
            })

            expect(loginStatusCode).toBe(200);

            const access_token = loginData.accessToken;
            const refresh_token = loginData.refreshToken;

            // Follow the existing previous user
            const { statusCode: followStatusCode, body: { data: followResData } } = await fetch.post(`${USER_URL}/${user._id}/follow`)
                .set('x-access-token', access_token).set('x-refresh-token', refresh_token);

            expect(followStatusCode).toBe(200);
            expect(followResData.following).toHaveLength(1);
            expect(followResData.following[0].toString()).toBe(user._id.toString());

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}/following/post`)
                .set('x-access-token', access_token)
                .set('x-refresh-token', refresh_token);

            expect(statusCode).toBe(200);
            expect(data).toHaveLength(2);

            followingPosts = data

        })


        it('Should return posts sorted by the newest', async () => {

            expect(followingPosts[0].post._id.toString()).toBe(post._id.toString());

        })
    })

})