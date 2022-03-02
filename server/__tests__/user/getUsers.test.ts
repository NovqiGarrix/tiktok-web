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

describe('getUser Unit Testing', () => {

    let user: UserReturn
    let tokens: { access_token: string, refresh_token: string }

    let pageOneRes: {
        user: Array<UserReturn>;
        nextURL: string | null;
        allPage: number;
        page: number;
    }
    let pageTwoRes: {
        user: Array<UserReturn>;
        nextURL: string | null;
        allPage: number;
        page: number;
    }

    let shouldAllUserInPageTwo: number;

    beforeAll(async () => {
        const NAMESPACE = 'BeforeAll';

        try {
            const mongo = await MongoMemoryServer.create();
            await mongoose.connect(mongo.getUri());

            // Create admin user
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

            await authService.register({
                country: 'ID',
                username: 'GetUser1',
                name: 'Get User 1',
                email: 'getUser1@gmail.com',
                password: 'getUser1@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

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

            await authService.register({
                country: 'ID',
                username: 'GetUser5',
                name: 'Get User 5',
                email: 'getUser5@gmail.com',
                password: 'getUser5@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser6',
                name: 'Get User 6',
                email: 'getUser6@gmail.com',
                password: 'getUser6@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser7',
                name: 'Get User 7',
                email: 'getUser7@gmail.com',
                password: 'getUser7@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser8',
                name: 'Get User 8',
                email: 'getUser8@gmail.com',
                password: 'getUser8@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser9',
                name: 'Get User 9',
                email: 'getUser9@gmail.com',
                password: 'getUser9@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser10',
                name: 'Get User 10',
                email: 'getUser10@gmail.com',
                password: 'getUser10@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            await authService.register({
                country: 'ID',
                username: 'GetUser11',
                name: 'Get User 11',
                email: 'getUser11@gmail.com',
                password: 'getUser11@gmail.com',
                type: 'user',
                isGoogleAccount: false
            })

            const pageOne = 1
            const { statusCode: pageOneStatusCode, body: { data: _pageOneData } } = await fetch.get(`${BASE_URL}/users?page=${pageOne}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token)

            expect(pageOneStatusCode).toBe(200);

            pageOneRes = _pageOneData

            const pageTwo = 2
            const { statusCode: pageTwoStatusCode, body: { data: _pageTwoData } } = await fetch.get(`${BASE_URL}/users?page=${pageTwo}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token)

            expect(pageTwoStatusCode).toBe(200);

            pageTwoRes = _pageTwoData

            shouldAllUserInPageTwo = (await userService.finds({}, 10, 10)).length

            user = data

        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
        }
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })


    it('Should return status code 406 and null for data because the user is not an admin', async () => {
        // Login the user to get accessToken
        const { body: { data: resLoginData } } = await fetch.post(AUTH_URL).send({
            email: 'getUser@gmail.com',
            password: 'getUser@gmail.com'
        })

        const { body: { data }, statusCode } = await fetch.get(`${BASE_URL}/users`).set('x-access-token', resLoginData.accessToken);
        expect(statusCode).toBe(406);
        expect(data).toBeNull();
    })

    // Find a user using query!
    it('Should return status code 200 and some users information', async () => {
        const { statusCode } = await fetch.post(`${AUTH_URL}/signUp`).send({
            username: 'admin',
            name: 'Admin 3000',
            email: 'admin@gmail.com',
            password: 'admin3000',
            type: 'admin',
            country: 'ID'
        })

        expect(statusCode).toBe(201);

        const { body: { data: loginData, error }, statusCode: loginStatusCode } = await fetch.post(AUTH_URL).send({
            email: 'admin@gmail.com',
            password: 'admin3000'
        })

        expect(error).toBeNull();
        expect({
            email: loginData.email
        }).toEqual({
            email: 'admin@gmail.com'
        })
        expect(loginStatusCode).toBe(200);


        // Find a user in query
        const { body: { data }, statusCode: getUserStatusCode } = await fetch.get(`${BASE_URL}/users?type=user`).set('x-access-token', loginData.accessToken);

        expect(getUserStatusCode).toBe(200);
        expect(data).not.toBeNull();
    })

    describe('Make sure pagination is working properly', () => {

        it('Should return page one if page = 0', async () => {

            const page = 0

            const { statusCode, body: { data } } = await fetch.get(`${BASE_URL}/users?page=${page}`)
                .set('x-access-token', tokens.access_token)
                .set('x-refresh-token', tokens.refresh_token);

            expect(statusCode).toBe(200);
            expect(data.user).toHaveLength(10);

        })

        it('Should return 10 posts for 1 page', async () => {
            expect(pageOneRes.user).toHaveLength(10);

            pageOneRes.user.forEach((post) => {
                const isAPostFromPageOne = pageOneRes.user.find((pageOneUser) => pageOneUser._id.toString() === post._id);
                expect(isAPostFromPageOne).toBeTruthy();
            })

        })

        it('Should return next URL for page 2', async () => {
            const shouldNextURL = `http://localhost:3001/api/v1/user/users?page=2`;
            expect(pageOneRes.nextURL).toBe(shouldNextURL);
        })

        it('Should return posts from page 2', async () => {
            const users = pageTwoRes.user

            expect(users).toHaveLength(shouldAllUserInPageTwo);

            users.forEach((responseUser) => {
                const isAPostInPageOne = pageOneRes.user.find((user) => user._id.toString() === responseUser._id.toString());
                expect(isAPostInPageOne).toBeFalsy();
            })

        })

        it('Should return null for nextURL if page >= allPage', async () => {
            expect(pageTwoRes.nextURL).toBeNull();
        })

    })

})