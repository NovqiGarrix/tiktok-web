import supertest from "supertest";
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authService from "../../src/service/auth.service";
import server from '../../src/server';

const app = server();

const fetch = supertest(app);
const BASE_URL = '/api/v1/auth';

describe('Login Unit Testing', () => {

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

    describe('Login without email', () => {

        const data = {
            password: "oke!"
        }

        it('Should return 500', async () => {
            await fetch.post(`${BASE_URL}`).send(data).expect(500);
        })

        it('Should return error object', async () => {
            await fetch.post(BASE_URL).send(data).then((res) => {

                const { error } = res.body

                expect(error[0].field).toBe("email")
                expect(error[0].message).toBe("Please provide email to login!")
            })
        })
    })

    describe('Login without password', () => {

        const data = {
            email: "novqigarrix@gmail.com"
        }

        it('Should return 500 for no password', async () => {

            await fetch.post(`${BASE_URL}`).send(data).expect(500);
        })

        it('Should return error object', async () => {
            await fetch.post(BASE_URL).send(data).then((res) => {
                const { error } = res.body

                expect(error[0].field).toBe("password");
                expect(error[0].message).toBe("Please provide password to login!")
            })
        })
    })

    describe('Login without email and password', () => {
        const data = {}

        it('should return 500', async () => {
            await fetch.post(BASE_URL).send(data).expect(500);
        })

        it('should return error object', async () => {
            await fetch.post(BASE_URL).send(data).then((res) => {
                const { error } = res.body;

                expect(error[0].field).toBe("email")
                expect(error[0].message).toBe("Please provide email to login!")

                expect(error[1].field).toBe("password");
                expect(error[1].message).toBe("Please provide password to login!")
            })
        })
    })

    describe('Login with wrong email', () => {

        const data = {
            email: "garrix@gmail.com",
            password: "Oke!"
        }

        it('Should return 403', async () => {
            await fetch.post(BASE_URL).send(data).expect(403);
        })

        it('Should return error message', async () => {
            await fetch.post(BASE_URL).send(data).then(async (res) => {
                const { error } = res.body

                expect(error).toBe("Invalid email or password!");
            })
        })
    })

    describe('Login with wrong password', () => {

        const data = {
            email: "novqigarrix@gmail.com",
            password: "password"
        }

        it('Should return error message and status 403', async () => {

            const user = await authService.register({
                username: "novqigarrix",
                name: "NovqiGarrix",
                email: "novqigarrix@gmail.com",
                password: "okeItsCool!!!!",
                type: "user",
                country: 'ID',
                isGoogleAccount: false
            })

            await fetch.post(BASE_URL).send(data).then((res) => {
                const { error } = res.body

                expect(res.statusCode).toBe(403);
                expect(error).toBe("Invalid email or password!");
            })
        })
    })

    describe('Login Success', () => {


        it('Should return 200 and error is null', async () => {
            // Create new account
            const user = await authService.register({
                username: "novqigarrix",
                name: "NovqiGarrix",
                email: "novqi@gmail.com",
                password: "okeItsCool!",
                type: "user",
                country: 'ID',
                isGoogleAccount: false
            })

            const data = {
                email: user.email,
                password: "okeItsCool!"
            }

            await fetch.post(BASE_URL).send(data).then((res) => {
                const { error } = res.body

                expect(res.statusCode).toBe(200);
                expect(error).toBeNull();
            });
        })

        it('Should not return password', async () => {
            const data = {
                email: "novqi@gmail.com",
                password: "okeItsCool!"
            }

            await fetch.post(BASE_URL).send(data).then((res) => {
                const { data: resData } = res.body

                expect(resData?.password).toBeUndefined();
            });
        })

        it('Should be the same user', async () => {

            const data = {
                email: "novqi@gmail.com",
                password: "okeItsCool!"
            }

            await fetch.post(BASE_URL).send(data).then((res) => {
                const { data: resData } = res.body

                expect({
                    email: resData.email,
                    name: resData.name,
                    role: resData.role
                }).toEqual({
                    "email": "novqi@gmail.com",
                    "name": "NovqiGarrix",
                    "role": 2,
                });
            });
        })
    })
})