import busboy from 'busboy';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { randomFillSync } from 'crypto';
import { createWriteStream, unlink } from 'fs';
import { readFile } from 'fs/promises';

import sendHTTPError from '../util/sendError';
import postsService from '../service/posts.service';
import logger from '../config/logger';
import userService from '../service/user.service';

import { ReqBodyChangeAllowCommenting, ReqBodyChangePostPrivacy, ReqBodySetPostData } from '../middleware/postRouteMiddleware';
import { GoogleApis } from '../util/googleapis';
import googleapisService from '../service/googleapis.service';
import { UserReturn } from '../model/user.model';
import { IPost } from '../model/posts.model';
import { decodeBase64 } from '../util/base64';
import { UserPost } from './user.controller';

dotenv.config();
export type UserAndPost = { user: UserPost, post: IPost }

export const uploadPost = async (req: Request, res: Response): Promise<busboy.Busboy> => {

    const newAccessToken = res.locals.newAccessToken

    try {

        const googleapis = new GoogleApis();

        const random = (() => {
            const buf = Buffer.alloc(16);
            return () => randomFillSync(buf).toString('hex');
        })();

        const bb = busboy({ headers: req.headers });
        let file_name: string;
        let mime_type: string;
        let saveTo: string;

        bb.on('file', (_name, file, info) => {

            const { filename: originalFilename, mimeType } = info

            // video/mp4
            // video/mkv
            const fileType = mimeType.split("/")[1];
            const validType = fileType === 'mp4' || fileType === 'mkv'
            if (!validType) return sendHTTPError(res, 'Invalid video file!', 406);

            saveTo = `./files/videos/${random()}.${fileType}`;
            const path = createWriteStream(saveTo);
            file.pipe(path);
            file_name = originalFilename
            mime_type = mimeType

        });

        bb.on('close', async () => {

            try {

                const path = './google-credentials.json';
                let credentials = JSON.parse((await readFile(path)).toString())!;
                const { expires_at } = credentials
                const now = Date.now();

                if (now >= expires_at) {
                    const newToken = await googleapisService.storeNewAccessToken(path);
                    if (!newToken) return console.log({ error: 'Failed to get new token' });

                    credentials = { ...credentials, ...newToken }
                }

                const oAuthClient = GoogleApis.getOAuthClient();
                oAuthClient.setCredentials(credentials);

                const drive = GoogleApis.getDrive(oAuthClient);

                const folderId = process.env.DRIVE_VIDEOS_FOLDER_ID!
                const uploadedFile = await googleapis.uploadFile(file_name, mime_type, saveTo, folderId, drive);

                const fileId = uploadedFile.id!

                // Change privacy
                await googleapis.updateFilePrivacy(fileId, 'reader', 'anyone', drive);

                const response = {
                    data: { saveTo, fileId },
                    newAccessToken,
                    error: null
                }

                return res.send(response);
            } catch (error) {
                console.log({ error })
            }

        });

        return req.pipe(bb);

    } catch (error: any) {
        console.log({ error });
        return sendHTTPError(res, error.message);
    }
}

export const setPostData = async (req: Request<{}, {}, ReqBodySetPostData>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { desc, privacy, fileId, saveTo, title } = req.body
    const { _id: userId, country } = res.locals.user

    try {

        const newPost = await postsService.uploadPost(userId, {
            fileId, desc, country, privacy, title
        })

        unlink(saveTo, (err) => err && logger.error('setPostData Unlink', err.message));

        const response = {
            data: newPost,
            newAccessToken,
            error: null
        }

        return res.status(201).send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export const changePostPrivacy = async (req: Request<{ postId: string }, {}, ReqBodyChangePostPrivacy>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { newPrivacy } = req.body
    const { postId } = req.params

    try {

        const updatedPost = await postsService.changePrivacy(postId, newPrivacy);
        if (!updatedPost) return sendHTTPError(res, 'Invalid request!', 404);

        const response = {
            data: updatedPost,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const changeAllowCommenting = async (req: Request<{ postId: string }, {}, ReqBodyChangeAllowCommenting>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { allowCommenting } = req.body
    const { postId } = req.params

    try {

        const updatedPost = await postsService.changeAllowCommenting(postId, allowCommenting);
        if (!updatedPost) return sendHTTPError(res, 'Invalid request!', 404);

        const response = {
            data: updatedPost,
            newAccessToken,
            error: null
        }

        return res.status(200).send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const deletedPost = async (req: Request<{ postId: string }>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { postId } = req.params

    try {

        const isDeleted = await postsService.deletePost(postId);
        if (!isDeleted) return sendHTTPError(res, 'Invalid request!', 406);

        const response = {
            data: isDeleted,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export const getPosts = async (req: Request, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken

    const page = req.query.page
    let currentPage = page ? Number(page) : 1
    const limit = 10

    const BASE_URL = process.env.BASE_URL!

    try {

        const countAllPost = await postsService.countAllData();

        // Posts -> 
        // 98    -> 98 / 10 =  floor(9.8) = 9 <= 
        // 98 % 10 !== 0 then still there is a left post, then allPage + 1

        const isModulo = countAllPost % limit === 0
        const allPage = isModulo ? Math.floor(countAllPost / limit) : (Math.floor(countAllPost / limit) + 1);

        if ((currentPage - 1) < 1) {
            currentPage = 1
        }

        // 1 - 1 =             0
        // 2 - 1 = (1 * 10) -> 10
        // 3 - 1 = (2 * 10) -> 20
        // 4 - 1 = (3 * 10) -> 30
        const skip = (currentPage - 1) * limit

        const { page, ...queries } = req.query

        const posts = await postsService.getPosts({ ...queries, privacy: 'public' }, limit, skip);

        let userAndPost: Array<UserAndPost> = []

        for await (const post of posts) {
            const user = await userService.findById(post.userId);
            if (user) userAndPost = [...userAndPost, { user: { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }, post }]
        }

        const nextURL = `${BASE_URL}/api/v1/post?page=${currentPage + 1}`;
        const nextUrl = currentPage >= allPage ? null : nextURL;

        const response = {
            data: {
                page: currentPage,
                nextURL: nextUrl, result: userAndPost, allPage
            },
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        console.log({ error })
        return sendHTTPError(res, error.message);
    }
}

export const getPost = async (req: Request<{ postId: string }>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { postId } = req.params
    const { _id: visitorId } = res.locals.user // visitor

    try {

        const post = await postsService.getPost({ _id: postId });
        if (!post) return sendHTTPError(res, 'Post not found!', 404);

        const user = await userService.findById(post.userId)!;

        const userAndPost = { post, user }

        const response = {
            data: userAndPost,
            newAccessToken,
            error: null
        }

        // Check whether the user was allowed to see the post
        switch (post.privacy) {
            case 'friends':
                const userOwnThePost = post.userId

                const relatedUser = await userService.findById(userOwnThePost);
                if (!relatedUser) return sendHTTPError(res, 'User not found!', 404);

                // First, check whether the visitor is the owner post
                if (visitorId.toString() === userOwnThePost.toString()) return res.send(response);

                // First, check whether the user follow the visitor
                const isFollowing = relatedUser.following.find((follow) => follow.toString() === visitorId.toString());
                if (!isFollowing) return sendHTTPError(res, 'Only the owner\s friends can see this post', 406);

                // Then, check whether the visitor follow the user
                const isAFollower = relatedUser.followers.find((follower) => follower.toString() === visitorId.toString());
                if (!isAFollower) return sendHTTPError(res, 'Only the owner\s friends can see this post', 406);

                return res.send(response);

            case 'private':
                const ownerPostId = post.userId

                const owner = await userService.findById(ownerPostId);
                if (!owner) return sendHTTPError(res, 'User not found!', 404);

                // Check whether the visitorId === to the userId
                if (visitorId.toString() !== owner._id.toString()) return sendHTTPError(res, 'Only the owner can see this post', 406);

                return res.send(response);

            default:
                return res.send(response);
        }

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const likePost = async (req: Request, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { _id: userId } = res.locals.user
    const { postId } = req.params

    try {

        const updatedPost = await postsService.likePost(userId, postId);
        if (!updatedPost) return sendHTTPError(res, 'Invalid request!', 406);

        const response = {
            data: updatedPost,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const unLikePost = async (req: Request, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { _id: userId } = res.locals.user
    const { postId } = req.params

    try {

        const updatedPost = await postsService.unLikePost(userId, postId);
        if (!updatedPost) return sendHTTPError(res, 'Invalid request!', 406);

        const response = {
            data: updatedPost,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const getFollowingPosts = async (_req: Request, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { following } = res.locals.user as UserReturn

    try {

        const posts = await postsService.getFollowingPosts(following);

        let userAndPost: Array<UserAndPost> = []

        for (const post of posts) {
            const user = await userService.findById(post.userId);
            if (user) userAndPost = [...userAndPost, { user: { verified: user.verified, userId: user._id, name: user.name, username: user.username, profile_picture: user.profile_picture }, post }]
        }

        const response = {
            data: {
                result: userAndPost
            },
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export const searchByDesc = async (req: Request<{}, {}, {}, { keyword: string; page: string }>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { keyword, page } = req.query
    if (!keyword) return sendHTTPError(res, 'Please specify your keyword!', 406);

    try {

        const results = await postsService.searchByName(keyword, page);

        let userAndPost: Array<UserAndPost> = []

        for (const post of results.post) {
            const user = await userService.findById(post.userId);
            if (user) userAndPost = [...userAndPost, { user: { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }, post }]
        }

        const SERVER_URL = process.env.SERVER_URL!
        const nextUrl = `${SERVER_URL}/api/v1/post/following/post?page=${results.currentPage + 1}`;
        const nextURL = results.currentPage >= results.allPage ? null : nextUrl

        const response = {
            data: {
                result: userAndPost,
                page: results.currentPage,
                allPage: results.allPage,
                nextURL
            },
            newAccessToken,
            error: null
        }

        return res.send(response)

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export const searchByTag = async (req: Request<{}, {}, {}, { tag: string; page: string }>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { tag, page } = req.query
    if (!tag) return sendHTTPError(res, 'Please specify your tag!', 406);

    try {

        const results = await postsService.searchByTag(decodeBase64(tag), page);

        let userAndPost: Array<UserAndPost> = []

        for (const post of results.post) {
            const user = await userService.findById(post.userId);
            if (user) userAndPost = [...userAndPost, { user: { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }, post }]
        }

        const SERVER_URL = process.env.SERVER_URL!
        const nextUrl = `${SERVER_URL}/api/v1/post/following/post?page=${results.currentPage + 1}`;
        const nextURL = results.currentPage >= results.allPage ? null : nextUrl

        const response = {
            data: {
                result: userAndPost,
                page: results.currentPage,
                allPage: results.allPage,
                nextURL
            },
            newAccessToken,
            error: null
        }

        return res.send(response)

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export const addPostLikes = async (req: Request, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { postId } = req.params

    try {

        const addedLikes = await postsService.addPostLike(postId)

        const response = {
            data: addedLikes,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export const addPostView = async (req: Request, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { postId } = req.params

    try {

        const result = await postsService.addPostView(postId);
        if (!result) return sendHTTPError(res, 'Invalid PostId', 406);

        const response = {
            data: result,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}