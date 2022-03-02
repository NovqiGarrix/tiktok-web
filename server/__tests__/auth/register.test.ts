import supertest from "supertest";
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import server from '../../src/server';

const app = server();

const fetch = supertest(app);
const REGISTER_URL = '/api/v1/auth/signUp';
const LOGIN_URL = '/api/v1/auth';

describe('Register Unit Testing', () => {

    beforeAll(async () => {
        try {
            const mongoServer = MongoMemoryServer.create();
            await mongoose.connect((await mongoServer).getUri());
        } catch (error) {
            console.log(error);
        }
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })

    describe('Register with empty object', () => {
        it('Should return 406', async () => {
            const { statusCode } = await fetch.post(REGISTER_URL).send({});

            expect(statusCode).toBe(406);
        })

        it('Should return error message', async () => {
            const { body: { error } } = await fetch.post(REGISTER_URL).send({});

            expect(error).toHaveLength(6);
            expect(error).toEqual([
                {
                    "field": "username",
                    "message": "Please provide a username to register new account!"
                },
                {
                    "field": "name",
                    "message": "Please provide a name to register new account!"
                },
                {
                    "field": "email",
                    "message": "Please provide a email to register new account!"
                },
                {
                    "field": "password",
                    "message": "Please provide a password to register new account!"
                },
                {
                    "field": "type",
                    "message": "Invalid enum value. Expected 'admin' | 'user', received undefined"
                },
                {
                    "field": "country",
                    "message": "Please provide your country to register new account!"
                }
            ])
        })
    });

    describe('Register with invalid email and invalid password', () => {
        it('Should return 406 for invalid email', async () => {
            const data = {
                name: "Vqii",
                email: "rixx",
                password: "okeOKEOKEOKE!",
                type: "user",
                country: 'ID'
            }

            const { statusCode } = await fetch.post(REGISTER_URL).send(data);
            expect(statusCode).toBe(406);
        })

        it('Should return 406 for invalid email', async () => {
            const data = {
                name: "Vqii",
                email: "rixxffff@gmail.com",
                password: "kk", // Passowrd less than 8 is invalid
                type: "user",
                country: 'ID'
            }

            const { statusCode } = await fetch.post(REGISTER_URL).send(data);
            expect(statusCode).toBe(406);
        })
    });


    describe('Register Success', () => {

        it('Should return 201', async () => {
            const data = {
                username: "novqigarrix",
                name: "Vqii",
                email: "rixx@gmail.com",
                password: "okeOKEOKEOKE!",
                type: "user",
                country: 'ID'
            }

            const { statusCode } = await fetch.post(REGISTER_URL).send(data);
            expect(statusCode).toBe(201);
        })

        it('Should return a fresh user', async () => {

            const data = {
                email: "rixx@gmail.com",
                password: "okeOKEOKEOKE!"
            }

            const { body: { data: resData } } = await fetch.post(LOGIN_URL).send(data);

            expect(resData).toEqual(expect.objectContaining({
                _id: expect.any(String),
                username: expect.any(String),
                name: expect.any(String),
                email: data.email,
                type: expect.any(String),
                role: expect.any(Number),
                country: expect.any(String),
                profile_picture: expect.any(String),
                following: [],
                followers: [],
                bio: expect.any(String),
                likes: 0,
                verified: expect.any(Number),
                videos: [],
                liked: [],
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                accessToken: expect.any(String),
                refreshToken: expect.any(String)
            }))
        })
    })

})