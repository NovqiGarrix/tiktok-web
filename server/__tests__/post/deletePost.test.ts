import supertest from "supertest";
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import server from '../../src/server';
import logger from "../../src/config/logger";
import authService from "../../src/service/auth.service";
import { UserReturn } from "../../src/model/user.model";
import { IPost, PostPrivacy } from "../../src/model/posts.model";
import postsService from "../../src/service/posts.service";

const BASE_URL = '/api/v1/post';
const AUTH_URL = '/api/v1/auth';
const app = server();
const fetch = supertest(app);

describe('deletedPost Route Test', () => {

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
            const desc = 'Video Test'
            const country = 'ID'
            const privacy: PostPrivacy = 'public';
            const userId = user._id

            post = await postsService.uploadPost(userId, { fileId, desc, country, privacy, title: 'Video Testtt' });
            expect(post).toBeTruthy();

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

            const { statusCode, body: { error, data } } = await fetch.patch(`${BASE_URL}/${post._id}`);

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    describe('Failed request cause the user does not own the post', () => {

        it('Should return error message and status code 406', async () => {

            const fakePostId = new mongoose.Types.ObjectId().toString();

            const { statusCode, body: { error } } = await fetch.delete(`${BASE_URL}/${fakePostId}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);


            expect(statusCode).toBe(404);
            expect(error).toBe('Post does not found!');

        })

    })

    describe('Success', () => {

        it('Should delete the post and return status code 200', async () => {

            const { statusCode, body: { data } } = await fetch.delete(`${BASE_URL}/${post._id}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data).toBe(true);

            // Try get the post again
            const deletedPost = await postsService.getPost({ _id: post._id });
            expect(deletedPost).toBeNull();
        })

    })

})