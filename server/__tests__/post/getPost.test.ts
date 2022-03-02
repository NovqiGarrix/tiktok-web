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

const BASE_URL = '/api/v1/post';
const AUTH_URL = '/api/v1/auth';
const app = server();
const fetch = supertest(app);

describe('getPost Route Test', () => {

    let user: UserReturn
    let posts: Array<{ post: IPost }> = []
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
            const userId = newUser._id

            const firstPost = await postsService.uploadPost(userId, { fileId, desc, country, privacy, title: 'My First Test Video' });
            const secondPost = await postsService.uploadPost(userId, { fileId, desc: 'Second Video', country, privacy, title: 'My Second Test Video' });
            const thirdPost = await postsService.uploadPost(userId, { fileId, desc: 'Third Video', country, privacy, title: 'My Third Test Video' });
            const fourthPost = await postsService.uploadPost(userId, { fileId, desc: 'Fourth Video', country: 'EN', privacy: 'private', title: 'My 4th Test Video' });
            const fifthPost = await postsService.uploadPost(userId, { fileId, desc: 'Fifth Video', country, privacy: 'friends', title: 'My 5th Test Video' });

            posts.push({ post: firstPost });
            posts.push({ post: secondPost });
            posts.push({ post: thirdPost });
            posts.push({ post: fourthPost });
            posts.push({ post: fifthPost });

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
     * 1. Failed request for no access_token
     * 2. Request for public post
     * 3. Request for friends privacy post
     * 4. Request for private privacy post
    **/

    describe('Failed request for no access_token', () => {

        it('Should return error message and status code 401', async () => {

            const { statusCode, body: { error, data } } = await fetch.get(`${BASE_URL}/${posts[0].post._id}/one`);

            expect(statusCode).toBe(401);
            expect(data).toBeNull();
            expect(error).toBe('Unauthorized!');
        })

    })

    describe('Request for public post', () => {

        it('Should public post', async () => {

            const post = posts.find(({ post }) => post.privacy === 'public')?.post;
            expect(post).not.toBeNull();
            if (!post) return;

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}/${post._id}/one`).set('x-access-token', tokens.access_token).set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.post.privacy).toBe('public');

        })

    })

    describe('Request for friends privacy post', () => {

        it('Should a friend privacy post', async () => {

            const post = posts.find(({ post }) => post.privacy === 'friends')?.post;
            expect(post).not.toBeNull();
            if (!post) return;

            const { statusCode, body: { data, error } } = await fetch.get(`${BASE_URL}/${post._id}/one`).set('x-access-token', tokens.access_token).set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.post.privacy).toBe('friends');

        })

        it('Should not return any post because the post owner not following the visitor', async () => {

            const post = posts.find(({ post }) => post.privacy === 'friends')?.post;
            expect(post).not.toBeNull();
            if (!post) return;

            // First create a new user
            const notFollowingUser = await authService.register({
                username: 'notFollowingUser',
                name: 'Not Following User',
                email: 'notFollowing@gmail.com',
                password: 'notFollowing',
                country: 'ID',
                type: 'user',
                isGoogleAccount: false
            })

            // Then log in the user to get access_token and refresh_token
            const { body: { data: loginData } } = await fetch.post(AUTH_URL).send({
                email: notFollowingUser.email,
                password: 'notFollowing'
            })

            expect(loginData).not.toBeNull();

            // Get the post by the new account (visitor)
            const { statusCode, body: { data, error } } = await fetch.get(`${BASE_URL}/${post._id}/one`).set('x-access-token', loginData.accessToken).set('x-refresh-token', loginData.refreshToken);

            expect(statusCode).toBe(406);
            expect(data).toBeNull();
            expect(error).toBe('Only the owner\s friends can see this post');
        })

        it('Should not return any post because the visitor does not following the post owner', async () => {

            const post = posts.find(({ post }) => post.privacy === 'friends')?.post;
            expect(post).not.toBeNull();
            if (!post) return;

            // First create a new user
            const notAFollower = await authService.register({
                username: 'notFollowingUser',
                name: 'Not A Follower',
                email: 'notAFollower@gmail.com',
                password: 'notAFollower',
                country: 'ID',
                type: 'user',
                isGoogleAccount: false
            })

            // Then log in the user to get access_token and refresh_token
            const { body: { data: loginData } } = await fetch.post(AUTH_URL).send({
                email: notAFollower.email,
                password: 'notAFollower'
            })

            expect(loginData).not.toBeNull();

            // Get the post by the new account (visitor)
            const { statusCode, body: { data, error } } = await fetch.get(`${BASE_URL}/${post._id}/one`).set('x-access-token', loginData.accessToken).set('x-refresh-token', loginData.refreshToken);

            expect(statusCode).toBe(406);
            expect(data).toBeNull();
            expect(error).toBe('Only the owner\s friends can see this post');
        })

        it('Should return a post because the Owner Post and the Visitor is a friend', async () => {

            const post = posts.find(({ post }) => post.privacy === 'friends')?.post;
            expect(post).not.toBeNull();
            if (!post) return;

            // Create a new user
            const friendOne = await authService.register({
                username: 'friendOne',
                name: 'Owner\s Friend',
                email: 'friendOne@gmail.com',
                password: 'friendOne',
                country: 'ID',
                type: 'user',
                isGoogleAccount: false
            })

            // Log in the user to get access_token and refresh_token
            const { body: { data: loginData } } = await fetch.post(AUTH_URL).send({
                email: friendOne.email,
                password: 'friendOne'
            })

            // Owner follow the visitor
            const ownerIsFollowed = await userService.follow(user._id, loginData._id);
            if (!ownerIsFollowed) return;

            // The visitor follow the owner
            const visitorIsFollowed = await userService.follow(loginData._id, user._id);
            if (!visitorIsFollowed) return;

            expect(ownerIsFollowed.following[0].toString()).toBe(visitorIsFollowed._id.toString());
            expect(visitorIsFollowed.following[0].toString()).toBe(ownerIsFollowed._id.toString());

            const { statusCode } = await fetch.get(`${BASE_URL}/${post._id}/one`).set('x-access-token', loginData.accessToken).set('x-refresh-token', loginData.refreshToken);
            expect(statusCode).toBe(200);
        })

    })

    describe('Request for private privacy post', () => {

        it('Should a private privacy post', async () => {

            const post = posts.find(({ post }) => post.privacy === 'private')?.post;
            expect(post).not.toBeNull();
            if (!post) return;

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}/${post._id}/one`).set('x-access-token', tokens.access_token).set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.post.privacy).toBe('private');

        })

        it('Should not return any post because no one can see private post except the owner itself', async () => {

            const post = posts.find(({ post }) => post.privacy === 'private')?.post;
            expect(post).not.toBeNull();
            if (!post) return;

            // First create a new user
            const privateVisitor = await authService.register({
                username: 'privateVisitor',
                name: 'A Private Visitor Post',
                email: 'privateVisitor@gmail.com',
                password: 'privateVisitor',
                country: 'ID',
                type: 'user',
                isGoogleAccount: false
            })

            // Then log in the user to get access_token and refresh_token
            const { body: { data: loginData } } = await fetch.post(AUTH_URL).send({
                email: privateVisitor.email,
                password: 'privateVisitor'
            })

            expect(loginData).not.toBeNull();

            // Get the post by the new account (visitor)
            const { statusCode, body: { data, error } } = await fetch.get(`${BASE_URL}/${post._id}/one`).set('x-access-token', loginData.accessToken).set('x-refresh-token', loginData.refreshToken);

            expect(statusCode).toBe(406);
            expect(data).toBeNull();
            expect(error).toBe('Only the owner can see this post');
        })

    })

})