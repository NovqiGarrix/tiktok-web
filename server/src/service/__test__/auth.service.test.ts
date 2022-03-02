import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import authService from '../auth.service';

describe('Auth Service Test', () => {

    beforeAll(async () => {
        const mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })

    describe('Register function', () => {

        it('Should create new user', async () => {

            const user = await authService.register({
                username: 'Novqi',
                name: 'NovqiGarrix',
                email: 'novqi@gmail.com',
                password: 'thereweGoo!!!',
                type: 'user',
                country: 'ID',
                isGoogleAccount: false
            });

            expect({
                username: 'Novqi',
                name: 'NovqiGarrix',
                email: 'novqi@gmail.com',
                role: 2,
                type: 'user',
            }).toEqual({
                username: user.username,
                name: user.name,
                email: user.email,
                type: 'user',
                role: user.role
            })
        })

    })

});
