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

describe('changePostPrivacy Route Test', () => {

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
                username: "changePrivacy",
                name: "Change Privact Post Unit Testing",
                email: "changePrivacyPost@gmail.com",
                password: "changePrivacyTest",
                country: "ID",
                type: 'user',
                isGoogleAccount: false
            })

            expect(newUser).not.toBeNull();
            user = newUser;

            // Login the user to get access_token and refresh_token
            const { body: { data: loginData } } = await fetch.post(AUTH_URL).send({
                email: newUser.email,
                password: 'changePrivacyTest'
            })

            tokens = {
                access_token: loginData.accessToken,
                refresh_token: loginData.refreshToken
            }

            // Create the post
            const fileId = '1_iwXSgI70MbIna0_6GIiZsz7vEBGJF3W';
            const desc = 'How to be an hilerious girl'
            const country = 'ID'
            const privacy: PostPrivacy = 'public';
            const userId = user._id

            post = await postsService.uploadPost(userId, {
                fileId, desc, country, privacy, title: 'Hilerous Girl!'
            })

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

    /** Test Cases
     * 1. Failed request for no access_token
     * 2. Failed request for empty body
     * 3. Failed request cause the user does not own the post
     * 4. Success
     *  
    **/

    describe('Failed request for no access_token', () => {

        it('Should return error message and status code 401', async () => {

            const reqBody = {}
            const { statusCode, body: { error, data } } = await fetch.patch(`${BASE_URL}/${post._id}/post_privacy`).send(reqBody);

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    describe('Failed request for empty body', () => {

        it('Should return error message and status code 406', async () => {

            const reqBody = {}
            const { statusCode, body: { error, data } } = await fetch.patch(`${BASE_URL}/${post._id}/post_privacy`)
                .send(reqBody)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(406);
            expect(data).toBeNull();
            expect(error).toHaveLength(1);
            expect(error).toEqual([
                {
                    "field": "newPrivacy",
                    "message": "Invalid enum value. Expected 'public' | 'private' | 'friends', received undefined"
                }
            ]);
        })

    })

    describe('Failed request cause the user does not own the post', () => {

        it('Should return error message and status code 406', async () => {

            const reqBody = {
                newPrivacy: 'friends',
            }

            const fakePostId = new mongoose.Types.ObjectId().toString()

            const { statusCode, body: { error } } = await fetch.patch(`${BASE_URL}/${fakePostId}/post_privacy`)
                .send(reqBody)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);


            expect(statusCode).toBe(406);
            expect(error).toBe('Invalid request!');

        })

    })

    describe('Success', () => {

        it('Should change the privacy and return status code 200', async () => {

            const reqBody = {
                newPrivacy: 'friends',
            }
            const { statusCode, body: { data } } = await fetch.patch(`${BASE_URL}/${post._id}/post_privacy`)
                .send(reqBody)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);


            expect(statusCode).toBe(200);
            expect(expect.objectContaining({
                _id: data._id,
                privacy: data.privacy
            })).toEqual(expect.objectContaining({
                _id: post._id,
                privacy: reqBody.newPrivacy
            }))

        })

    })

})