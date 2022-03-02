import supertest from "supertest";
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import server from '../../src/server';
import logger from "../../src/config/logger";
import authService from "../../src/service/auth.service";
import { UserReturn } from "../../src/model/user.model";

const BASE_URL = '/api/v1/post';
const AUTH_URL = '/api/v1/auth';
const app = server();
const fetch = supertest(app);

describe('uploadPost Route Test', () => {

    let user: UserReturn
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

    /* Test Cases

     * 1. Failed with no access_token
     * 2. Failed with empty request body
     * 3. Failed with invalid file // avi, gif, mp3, wav, etc..
     * 4. Success test
     
    */

    describe('Failed with no access_token', () => {

        it('Should return an error message and status code 401', async () => {

            const { body: { data, error }, statusCode } = await fetch.post(`${BASE_URL}/post_data`).send({});

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    describe('Failed with empty request body', () => {

        it('Should return an error message and status code 406', async () => {

            const { body: { data, error }, statusCode } = await fetch.post(`${BASE_URL}/post_data`)
                .send({})
                .set('x-access-token', tokens.access_token).set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(406);
            expect(data).toBeNull();
            expect(error).toHaveLength(5);
            expect(error).toEqual([
                {
                    "field": "title",
                    "message": "Post Title is required!"
                },
                {
                    "field": "desc",
                    "message": "Post Description is required!"
                },
                {
                    "field": "privacy",
                    "message": "Invalid enum value. Expected 'public' | 'private' | 'friends', received undefined"
                },
                {
                    "field": "saveTo",
                    "message": "saveTo is required!"
                },
                {
                    "field": "fileId",
                    "message": "fileId is required!"
                }
            ]);

        })

    })

    describe('Failed with invalid file (image file)', () => {

        it('Should return an error message and status code 406', async () => {

            const samplePicture = './files/profile_pictures/picture-test.png';
            const { statusCode, body: { data, error } } = await fetch.post(BASE_URL)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token)
                .attach("file", samplePicture);

            expect(statusCode).toBe(406);
            expect(data).toBeNull();
            expect(error).toBe('Invalid video file!');

        })

    })

    describe('Success', () => {

        let saveTo: string;
        let fileId: string;

        it('Should return new post and file uploaded', (done) => {

            // First, we need to upload the video as a temporary video
            const videoSample = './files/videos/video-test.mp4';
            fetch.post(BASE_URL)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token)
                .attach("file", videoSample)
                .end((_err, res) => {
                    const { statusCode: uploadDataStatusCode, body: { data: uploadData } } = res

                    expect(uploadDataStatusCode).toBe(200);
                    expect(uploadData).toEqual(expect.objectContaining({
                        saveTo: expect.any(String),
                        fileId: expect.any(String)
                    }))

                    saveTo = uploadData.saveTo
                    fileId = uploadData.fileId
                    done();
                })
        })

        it('Should return new post', (done) => {
            // Next, set the post description, and privacy
            const reqBody = {
                desc: 'Cool!', privacy: 'public', saveTo, fileId, title: 'Should return new post'
            }
            fetch.post(`${BASE_URL}/post_data`).send(reqBody)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token)
                .end((_err, res) => {
                    const { statusCode, body: { data } } = res

                    expect(statusCode).toBe(201);
                    expect(data).toEqual(expect.objectContaining({
                        _id: expect.any(String),
                        userId: expect.any(String),
                        file: expect.any(String),
                        title: expect.any(String),
                        desc: reqBody.desc,
                        country: user.country,
                        likes: 0,
                        comments: [],
                        privacy: reqBody.privacy,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String)
                    }))

                    done();
                })
        })
    })

})