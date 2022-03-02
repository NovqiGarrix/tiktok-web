import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import postsService from '../posts.service';
import { AllowComment, IPost, PostPrivacy } from '../../model/posts.model';
import authService from '../auth.service';
import { UserReturn } from '../../model/user.model';
import { IComment } from '../../model/comment.model';
import userService from '../user.service';

describe('Post Service Test', () => {

    let post: IPost;
    let user: UserReturn;
    let firstComment: IComment;

    beforeAll(async () => {
        const mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })

    describe('uploadPost function', () => {

        it('Should return new post', async () => {

            // Register new user
            user = await authService.register({
                username: 'user',
                name: 'User 1',
                email: 'user@gmail.com',
                password: 'user@gmail.com',
                type: 'user',
                country: 'ID',
                isGoogleAccount: false
            })

            const fileId = '1_iwXSgI70MbIna0_6GIiZsz7vEBGJF3W';
            const desc = 'How to be an hilerious girl'
            const country = 'ID'
            const privacy: PostPrivacy = 'public';
            const userId = user._id

            post = await postsService.uploadPost(userId, {
                fileId, desc, country, privacy, title: 'Hilerious Girl'
            })

            await postsService.uploadPost(userId, {
                fileId, desc: 'Awesome video for the first new year\s video',
                country: 'ID', privacy: 'public', title: 'Awesome video'
            })

            await postsService.uploadPost(userId, {
                fileId, desc: 'My First video in 2022 #excited #2022 #firstVideo #first',
                country: 'ID', privacy: 'public', title: 'First Video in 2022'
            })

            expect(post).toEqual({
                _id: expect.any(String),
                userId,
                file: expect.any(String),
                title: expect.any(String),
                desc,
                country,
                likes: 0,
                comments: [],
                privacy,
                viewed: expect.any(Number),
                allowComment: 'allow',
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            })

        })

    })

    describe('changePrivacy function', () => {

        it('Should return new privacy', async () => {

            const prevPrivacy = post.privacy;
            const newPrivacy: PostPrivacy = 'friends';

            const updatedPost = await postsService.changePrivacy(post._id, newPrivacy);
            if (!updatedPost) return;

            expect(post._id).toBe(updatedPost._id.toString());
            expect(newPrivacy).toBe(updatedPost.privacy);
            expect(newPrivacy).not.toBe(prevPrivacy);
        })

    })

    describe('changeAllowCommenting function', () => {

        it('Should return new allowCommenting', async () => {

            const prevAllowCommenting: AllowComment = 'allow';
            const newAllowCommenting: AllowComment = 'disallowed';

            const updatedPost = await postsService.changeAllowCommenting(post._id, newAllowCommenting);
            if (!updatedPost) return;

            expect(newAllowCommenting).toBe('disallowed');
            expect(newAllowCommenting).not.toBe(prevAllowCommenting);
        })

    })

    describe('addComment function', () => {

        it('Should return new comment on a post', async () => {

            const comment = 'That\s amazing✌️';

            const newComment = await postsService.addComment({
                userId: user._id,
                postId: post._id,
                comment
            })

            expect(expect.objectContaining({
                userId: user._id,
                postId: post._id,
                comment
            })).toEqual(expect.objectContaining({
                userId: newComment.userId,
                postId: newComment.postId,
                comment: newComment.comment
            }))

            firstComment = newComment

            const updatedPost = await postsService.getPost({ userId: user._id, _id: post._id });
            if (!updatedPost) return;

            expect(updatedPost.comments).toHaveLength(1);

        })

        it('Should return a comment that reply to a comment', async () => {

            const comment = 'Exactly, that\s insane😍😍';
            const replyTo = firstComment._id

            // Register new user
            const newUser = await authService.register({
                username: 'user',
                name: 'User 2',
                email: 'user2@gmail.com',
                password: 'user2@gmail.com',
                type: 'user',
                country: 'ID',
                isGoogleAccount: false
            })

            const newComment = await postsService.addComment({
                userId: newUser._id,
                postId: post._id,
                comment,
                replyTo
            })

            expect(newComment.replyTo).toBe(replyTo);

            const updatedPost = await postsService.getPost({ userId: user._id, _id: post._id });
            if (!updatedPost) return;

            expect(updatedPost.comments).toHaveLength(2);

        })

    })

    describe('deletePost function', () => {

        it('Should return a boolean either success or not', async () => {

            const fileId = '1_iwXSgI70MbIna0_6GIiZsz7vEBGJF3W';
            const desc = 'Video Test'
            const country = 'ID'
            const privacy: PostPrivacy = 'public';
            const userId = user._id

            const newPost = await postsService.uploadPost(userId, { fileId, desc, country, privacy, title: 'Video testing in 2022' });
            expect(newPost).toBeTruthy();

            // Try to delete post and get it back
            const isDeleted = await postsService.deletePost(newPost._id);
            expect(isDeleted).toBe(true);

            // Get it back
            const deletedPost = await postsService.getPost({ _id: newPost._id });
            expect(deletedPost).toBeNull();

        })

    })

    describe('likePost function', () => {

        it('Should return null for invalid postId', async () => {

            const fakePostId = new mongoose.Types.ObjectId().toString();

            const likedPost = await postsService.likePost(user._id, fakePostId);
            expect(likedPost).toBeNull();

        })

        it('Should return null for invalid userId', async () => {

            const fakePostId = new mongoose.Types.ObjectId().toString();

            const likedPost = await postsService.likePost(fakePostId, post._id);
            expect(likedPost).toBeNull();

        })

        it('Should return likedPost', async () => {

            const likedPost = await postsService.likePost(user._id, post._id);
            if (!likedPost) return;

            expect(likedPost).not.toBeNull();
            expect(likedPost.post.likes).toBe(1);

        })

        it('Should update user liked post', async () => {

            const updatedUser = await userService.findById(user._id);
            if (!updatedUser) return;

            expect(updatedUser.liked).toHaveLength(1);
            expect(updatedUser.liked[0].toString()).toBe(post._id.toString());

        })

    })

    describe('unLikePost function', () => {

        it('Should return null for invalid postId', async () => {

            const fakePostId = new mongoose.Types.ObjectId().toString();

            const likedPost = await postsService.unLikePost(user._id, fakePostId);
            expect(likedPost).toBeNull();

        })

        it('Should return null for invalid userId', async () => {

            const fakePostId = new mongoose.Types.ObjectId().toString();

            const likedPost = await postsService.unLikePost(fakePostId, post._id);
            expect(likedPost).toBeNull();

        })

        it('Should return unLikedPost', async () => {

            const likedPost = await postsService.unLikePost(user._id, post._id);
            if (!likedPost) return;

            expect(likedPost).not.toBeNull();
            expect(likedPost.post.likes).toBe(0);

        })

        it('Should update user liked post', async () => {

            const updatedUser = await userService.findById(user._id);
            if (!updatedUser) return;

            expect(updatedUser.liked).toHaveLength(0);

        })

    })

    describe('Count All Posts in the Database', () => {

        it('Should return number of all posts', async () => {
            const allPosts = await postsService.countAllData();
            expect(allPosts).toStrictEqual(expect.any(Number));
        })

    })

    describe('searchByName function', () => {

        it('Should return search result based on the keyword with undefined page', async () => {

            // If the page was undefined, then it should initialize number 1 as the page
            const results = await postsService.searchByName('girl', undefined);

            const post = results.post
            expect(post).toHaveLength(1);
            expect(results.currentPage).toBe(1)

        })

        it('Should return search result based on the keyword from page 1', async () => {

            // The page is a string, because it'll coming from req.query
            const results = await postsService.searchByName('video', '1');

            const post = results.post
            expect(post).toHaveLength(2);
            expect(results.currentPage).toBe(1)

        })


    })

    describe('searchByTag function', () => {

        it('Should return search result based on the tag with undefined page', async () => {

            // If the page was undefined, then it should initialize number 1 as the page
            const results = await postsService.searchByTag('#excited', undefined);

            const post = results.post
            expect(post).toHaveLength(1);
            expect(results.currentPage).toBe(1)

        })

        it('Should return search result based on the tag from page 1', async () => {

            // The page is a string, because it'll coming from req.query
            const results = await postsService.searchByTag('#first', '1');

            const post = results.post
            expect(post).toHaveLength(2); // 2 bcs, there are 2 "first" word within the the post desc
            expect(results.currentPage).toBe(1)

        })

    })

})