import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';

import server from '../../src/server';
import logger from '../../src/config/logger';

const BASE_URL = '/api/v1/user';
const AUTH_URL = '/api/v1/auth';

const app = server();
const fetch = supertest(app);

describe('getCurrentUser Unit Testing', () => {

    beforeAll(async () => {
        const NAMESPACE = 'BeforeAll';

        try {
            const mongo = await MongoMemoryServer.create();
            await mongoose.connect(mongo.getUri());
        } catch (error: any) {
            logger.error(NAMESPACE, error.message);
        }
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })


    let accessToken: string;
    let userId: string;

    it('It should return status code 401 and data is null', async () => {

        // Register new user
        const { statusCode: registerStatusCode } = await fetch.post(`${AUTH_URL}/signUp`).send({
            username: 'getCurrentUser',
            email: 'getCurrentUser@gmail.com',
            password: 'getCurrentUser',
            name: 'Get Current User',
            type: 'user',
            country: 'ID'
        });

        expect(registerStatusCode).toBe(201);

        // Login the user to get accessToken
        const { body: { data: resLoginData } } = await fetch.post(AUTH_URL).send({
            email: 'getCurrentUser@gmail.com',
            password: 'getCurrentUser'
        })

        userId = resLoginData._id;
        accessToken = resLoginData.accessToken;

        // Trying getCurrentUser without accessToken
        const { body: { error, data }, statusCode } = await fetch.get(BASE_URL);

        expect(statusCode).toBe(401); // 401 -> HTTP Code for Unauthorized
        expect(error).not.toBeNull();
        expect(data).toBeNull();
    })

    it('Should return currentUser', async () => {
        const { body: { data } } = await fetch.get(BASE_URL).set('x-access-token', accessToken);
        expect({
            _id: userId
        }).toEqual({
            _id: data._id
        })
    })

    it('Should not return user password', async () => {
        const { body: { data } } = await fetch.get(BASE_URL).set('x-access-token', accessToken);

        expect(data?.password).toBeUndefined();
    })

})