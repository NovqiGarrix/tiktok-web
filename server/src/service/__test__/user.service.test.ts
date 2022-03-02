import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { UserReturn } from '../../model/user.model';
import jwt from '../../util/jwt';
import authService from '../auth.service';
import userService from '../user.service';

describe('Auth Service Test', () => {

    let userId: string;
    let user: UserReturn

    beforeAll(async () => {
        const mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })

    describe('createUser function', () => {
        it('Should return new user', async () => {

            const profile_picture = `https://ui-avatars.com/api?name=novqigarrix&background=000&color=fff`

            const newUser = await userService.createUser({
                username: 'novqigarrix',
                name: 'NovqiGarrix',
                email: 'helxii@gmail.com',
                password: 'xixixixi!',
                role: 2,
                type: 'user',
                profile_picture,
                bio: 'No Bio yet',
                country: 'ID',
                isGoogleAccount: false
            })

            userId = newUser._id;
            user = newUser

            expect({
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                type: newUser.type,
                profile_picture: newUser.profile_picture,
                bio: newUser.bio
            }).toEqual({
                username: 'novqigarrix',
                name: 'NovqiGarrix',
                email: 'helxii@gmail.com',
                role: 2,
                type: 'user',
                profile_picture,
                bio: 'No Bio yet'
            })
        })
    });

    describe('reIssueAccessToken function', () => {
        it('Should return new access token', async () => {
            const newAccessToken = await userService.reIssueAccessToken('novqigarrix@gmail.com');

            expect(newAccessToken).not.toBeNull();
            expect(newAccessToken).not.toBe("ERROR!");
        })

        it('Should be a valid token', async () => {
            const email = 'hello@gmail.com';
            const newAccessToken = await userService.reIssueAccessToken(email);
            const { valid, data } = jwt.verifyToken<{ email: string }>(newAccessToken);

            expect(valid).toBeTruthy();
            expect(data).not.toBeNull();
            expect({ email }).toEqual({ email: data?.email });
        })
    })

    describe('updateBio function', () => {
        it('Should return the newBio', async () => {
            const newBio = 'Hello World!';

            const updatedBio = await userService.updateBio(userId, newBio);

            expect({
                _id: updatedBio?._id,
                bio: updatedBio?.bio
            }).toEqual({
                _id: userId,
                bio: newBio
            })
        })
    })

    describe('updateProfilePicture function', () => {
        it('Should return new profile_picture', async () => {

            const user = await userService.findById(userId);
            if (!user) return;

            const prevProfilePicture = user.profile_picture

            const fileId = '1OtgSrDloldJm6kD0CvxdND_l8iHf8k3c';

            const updatedUser = await userService.updateProfilePicture(userId, fileId);
            if (!updatedUser) return;

            expect(updatedUser.profile_picture).not.toBe(prevProfilePicture);
        })
    })

    describe('follow function', () => {

        it('Should return null for invalidId', async () => {

            const fakeUserId = new mongoose.Types.ObjectId().toString();

            const follow = await userService.follow(userId, fakeUserId);
            expect(follow).toBeNull();

        })

        it('Should return user that has a followers id', async () => {

            // Create new user
            const newUser = await authService.register({
                username: 'user3',
                name: 'Third User',
                email: 'user3@gmail.com',
                password: 'thirdUser',
                country: 'ID',
                type: 'user',
                isGoogleAccount: false
            })

            expect(newUser).toBeTruthy();

            const follow = await userService.follow(newUser._id, userId);
            if (!follow) return;

            expect(follow._id.toString()).toBe(newUser._id.toString());

            const updatedUser = await userService.findById(userId);
            if (!updatedUser) return;

            expect(updatedUser.followers).toHaveLength(1);
            expect(updatedUser.followers[0]).toBe(newUser._id);

            const updatedNewUser = await userService.findById(newUser._id);
            if (!updatedNewUser) return;

            expect(updatedNewUser.following).toHaveLength(1);
            expect(updatedNewUser.following[0]).toBe(userId);
        })

    })

    describe('changeLikedVideosStatus function', () => {

        it('Should return new ShowLikedVideo status', async () => {

            const updatedUser = await userService.changeLikedVideosStatus(userId, 'false');
            if (!updatedUser) return;

            expect(updatedUser.showLikedVideos).not.toBe(user.showLikedVideos);
            expect(updatedUser.showLikedVideos).toBe('false');

        })

    })

    describe('countAllUsers function', () => {

        it('Should return number of all users', async () => {
            const allPosts = await userService.countAllUser();
            expect(allPosts).toStrictEqual(expect.any(Number));
        })

    })

    describe('createUserForGoogleUser function', () => {

        it('Should return isGoogleAccount = true, and there\s no password', async () => {

            const profile_picture = `https://ui-avatars.com/api?name=Smart Google User&background=000&color=fff`

            const googleUser = await userService.createUserForGoogleUser({
                username: 'smartGoogleUser',
                email: 'smartGoogleUser@gmail.com',
                name: "Smart Google User",
                bio: 'No Bio Yet!',
                profile_picture: encodeURI(profile_picture),
                country: 'ID',
                isGoogleAccount: true
            })

            expect(googleUser.isGoogleAccount).toBe(true);

        })

    })

    describe('updateUsername function', () => {

        it('Should return new username', async () => {

            const newUsername = 'garrixsHere';

            const updatedUser = await userService.updateUsername(user._id, newUsername);
            if (!updatedUser) return;

            expect(updatedUser._id.toString()).toBe(user._id.toString());
            expect(updatedUser.username).toBe(newUsername);
        })

    })

    describe('searchByName function', () => {

        it('Should return search result based on the keyword with undefined page', async () => {

            const results = await userService.searchByName('novqigarrix', undefined);
            expect(results.user).toHaveLength(1);
            expect(results.currentPage).toBe(1);
            expect(results.allPage).toBe(1);

        })

        it('Should return search result based on the keyword', async () => {

            const results = await userService.searchByName('smart', undefined);
            expect(results.user).toHaveLength(1);
            expect(results.currentPage).toBe(1);
            expect(results.allPage).toBe(1);

        })

    })

});
