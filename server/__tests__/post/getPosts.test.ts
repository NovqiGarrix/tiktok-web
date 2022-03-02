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

describe('getPosts Route Test', () => {

    let user: UserReturn
    let post: IPost
    let pageOneRes: {
        result: Array<{ post: IPost, user: UserReturn }>;
        nextURL: string | null;
        allPage: number;
        page: number;
    }
    let pageTwoRes: {
        result: Array<{ post: IPost, user: UserReturn }>;
        nextURL: string | null;
        allPage: number;
        page: number;
    }

    let allPublicPosts: number;
    let allENPosts: number;
    let shouldAllPostInPageTwo: number;

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

            post = await postsService.uploadPost(userId, { fileId, desc, country, privacy, title: 'My First Cool Video' });
            expect(post).toBeTruthy();

            await postsService.uploadPost(userId, { fileId, desc: 'Second Video', country, privacy, title: 'My Second Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: 'Third Video', country, privacy, title: 'My Third Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: 'Fourth Video', country: 'EN', privacy, title: 'My 4th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '7th Video', country, privacy, title: 'My 5th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '8th Video', country, privacy, title: 'My 6th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '9th Video', country, privacy, title: 'My 7th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '10th Video', country, privacy, title: 'My 8th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '11th Video', country, privacy, title: 'My 9th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '12th Video', country, privacy, title: 'My 10th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '13th Video', country, privacy, title: 'My 11th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '14th Video', country, privacy, title: 'My 12th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '15th Video', country, privacy, title: 'My 13th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: '16th Video', country, privacy, title: 'My 14th Cool Video' });
            await postsService.uploadPost(userId, { fileId, desc: 'Sixth Video', country, privacy: 'friends', title: 'My 15th Cool Video' });

            allPublicPosts = (await postsService.getPosts({ privacy: 'public', country: 'ID' }, 10, 0)).length;
            allENPosts = (await postsService.getPosts({ country: 'EN', privacy: 'public' }, 10, 0)).length;

            shouldAllPostInPageTwo = (await postsService.getPosts({ privacy: 'public' }, 10, 10)).length;


            const pageOne = 1
            const { statusCode: pageOneStatusCode, body: { data: pageOneResponse } } = await fetch.get(`${BASE_URL}?page=${pageOne}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(pageOneStatusCode).toBe(200);
            pageOneRes = pageOneResponse

            const pageTwo = 2
            const { statusCode: pageTwoStatusCode, body: { data: pageTwoResponse } } = await fetch.get(`${BASE_URL}?page=${pageTwo}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(pageTwoStatusCode).toBe(200);
            pageTwoRes = pageTwoResponse

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
     * Test Cases
     * 2. Failed request for invalid queries
     * 3. All post must public
     * 4. Filter posts based on queries
    **/

    describe('Failed request for invalid queries', () => {

        it('Should return error message and status code 406', async () => {

            // field _id is not allowed for queries, check getPostsRequest.ts
            const { statusCode, body: { error } } = await fetch.get(`${BASE_URL}?country=ID&_id=1`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(406);
            expect(error).toBe('Invalid queries!');
        })

    })

    describe('All post must public', () => {

        it('Should return all posts that has public privacy', async () => {

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}?country=ID`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.result).toHaveLength(allPublicPosts);

            data.result.forEach(({ post, user: _ }: { post: IPost; user: any }) => {
                expect(post.privacy).toBe('public');
            })
        })

    })

    describe('Filter posts based on queries', () => {

        it('Should return all posts filtered', async () => {

            const country = 'EN';

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}?country=${country}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.result).toHaveLength(allENPosts);

            data.result.forEach(({ post }: { post: IPost }) => {
                expect(post.privacy).toBe('public');
                expect(post.country).toBe(country);
            })
        })

    })

    describe('Make sure pagination is working properly', () => {

        it('Should return page one if page = 0', async () => {

            const page = 0

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}?page=${page}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.result).toHaveLength(10);

        })

        it('Should return 10 posts for 1 page', async () => {
            expect(pageOneRes.result).toHaveLength(10);

            pageOneRes.result.forEach(({ post }) => {
                const isAPostFromPageOne = pageOneRes.result.find(({ post: pageOnePost }) => pageOnePost._id.toString() === post._id);
                expect(isAPostFromPageOne).toBeTruthy();
            })

        })

        it('Should return next URL for page 2', async () => {
            const shouldNextURL = `http://localhost:3001/api/v1/post?page=2`;
            expect(pageOneRes.nextURL).toBe(shouldNextURL);
        })

        it('Should return posts from page 2', async () => {
            const post = pageTwoRes.result

            expect(post).toHaveLength(shouldAllPostInPageTwo);

            post.forEach(({ post: responsePost }) => {
                const isAPostInPageOne = pageOneRes.result.find(({ post }) => post._id.toString() === responsePost._id.toString());
                expect(isAPostInPageOne).toBeFalsy();
            })

        })

        it('Should return null for nextURL if page >= allPage', async () => {
            expect(pageTwoRes.nextURL).toBeNull();
        })

        it('Should return posts based on userId', async () => {

            const { statusCode: pageOneStatusCode, body: { data: pageOne } } = await fetch.get(`${BASE_URL}?userId=${user._id.toString()}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(pageOneStatusCode).toBe(200);

            const { statusCode: pageTwoStatusCode, body: { data: pageTwo } } = await fetch.get(`${BASE_URL}?userId=${user._id.toString()}&page=2`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(pageTwoStatusCode).toBe(200);

            const posts = [...pageOne.result, ...pageTwo.result]
            expect(posts).toHaveLength(14);

        })

    })

})