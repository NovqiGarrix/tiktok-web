import { Request, Response } from 'express';
import fs from 'fs';
import { readFile } from 'fs/promises';
import busboy from 'busboy';

import userService from '../service/user.service';
import sendHTTPError from '../util/sendError';
import { ReqBodyChangeLikedVideoStatus, ReqBodyUpdateBio } from '../middleware/userRouteMiddleware';
import { GoogleApis } from '../util/googleapis';
import { randomFillSync } from 'crypto';
import googleapisService from '../service/googleapis.service';

export type UserPost = { userId: string; username: string; name: string; profile_picture: string; verified: number }

export const getCurrentUser = async (_req: Request, res: Response): Promise<Response> => {

    const user = res.locals.user
    const newAccessToken = res.locals.newAccessToken

    let { password, ...rest } = user

    try {

        let followingUsers: Array<UserPost> = []
        let followers: Array<UserPost> = []

        for (const userId of rest.following) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followingUsers = [...followingUsers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        for (const userId of rest.followers) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followers = [...followers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        rest = {
            ...rest,
            following: followingUsers, followers
        }

        const response = {
            data: rest,
            newAccessToken,
            error: null
        }
        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const getUsers = async (req: Request, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken

    const page = req.query.page
    let currentPage = page ? Number(page) : 1
    const limit = 10

    const BASE_URL = process.env.BASE_URL!

    try {

        const countAllUser = await userService.countAllUser();

        // 98    -> 98 / 10 =  floor(9.8) = 9 <= 
        // 98 % 10 !== 0 then still there is a left post, then allPage + 1

        const isModulo = countAllUser % limit === 0
        const allPage = isModulo ? Math.floor(countAllUser / limit) : (Math.floor(countAllUser / limit) + 1);

        if ((currentPage - 1) < 1) {
            currentPage = 1
        }

        // 1 - 1 =             0
        // 2 - 1 = (1 * 10) -> 10
        // 3 - 1 = (2 * 10) -> 20
        // 4 - 1 = (3 * 10) -> 30
        const skip = (currentPage - 1) * limit

        const { page, ...queries } = req.query

        const users = await userService.finds({ ...queries }, limit, skip);
        const nextURL = `${BASE_URL}/api/v1/user/users?page=${currentPage + 1}`;
        const nextUrl = currentPage >= allPage ? null : nextURL;

        const response = {
            data: {
                page: currentPage,
                nextURL: nextUrl, user: users, allPage
            },
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const updateBio = async (req: Request<{}, {}, ReqBodyUpdateBio>, res: Response): Promise<Response> => {

    const { newBio } = req.body
    const { _id } = res.locals.user;
    const newAccessToken = res.locals.newAccessToken

    try {

        const updatedBio = await userService.updateBio(_id, newBio);
        if (!updatedBio) return sendHTTPError(res, 'Invalid request!', 406);

        let followingUsers: Array<UserPost> = []
        let followers: Array<UserPost> = []

        for (const userId of updatedBio.following) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followingUsers = [...followingUsers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        for (const userId of updatedBio.followers) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followers = [...followers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        const user = {
            ...updatedBio,
            following: followingUsers, followers
        }

        const response = {
            data: user,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const changeProfilePicture = async (req: Request, res: Response): Promise<busboy.Busboy> => {

    const { _id: userId, profile_picture: prevProfilePicture } = res.locals.user
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
            const fileType = mimeType.split("/")[1];
            const validType = fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg'
            if (!validType) return sendHTTPError(res, 'Invalid image file!', 406);

            saveTo = `./files/profile_pictures/${random()}.${fileType}`;
            const path = fs.createWriteStream(saveTo);
            file.pipe(path);
            file_name = originalFilename
            mime_type = mimeType

        });

        bb.on('close', async () => {
            try {

                const path = './google-credentials.json';

                let credentials = JSON.parse((await readFile(path)).toString())!;
                const now = Date.now();

                if (now >= credentials.expires_at) {
                    const newToken = await googleapisService.storeNewAccessToken(path);
                    if (!newToken) return console.log({ error: 'Failed to get new token' });

                    credentials = { ...credentials, ...newToken }
                }

                const oAuthClient = GoogleApis.getOAuthClient();
                oAuthClient.setCredentials(credentials);

                const drive = GoogleApis.getDrive(oAuthClient);

                const folderId = process.env.DRIVE_PROFILE_FOLDER_ID!
                const uploadedFile = await googleapis.uploadFile(file_name, mime_type, saveTo, folderId, drive);
                const fileId = uploadedFile.id!

                // Change privacy
                await googleapis.updateFilePrivacy(fileId, 'reader', 'anyone', drive);

                // Update profile_picture
                const updatedUser = await userService.updateProfilePicture(userId, fileId);
                if (!updatedUser) return sendHTTPError(res, 'Invalid Request', 406);

                let followingUsers: Array<UserPost> = []
                let followers: Array<UserPost> = []

                for (const userId of updatedUser.following) {
                    if (userId) {
                        const user = await userService.findById(userId);
                        if (user) followingUsers = [...followingUsers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
                    }
                }

                for (const userId of updatedUser.followers) {
                    if (userId) {
                        const user = await userService.findById(userId);
                        if (user) followers = [...followers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
                    }
                }

                const user = {
                    ...updatedUser,
                    following: followingUsers, followers
                }

                // Remove prev picture in drive
                const prevPictureId = prevProfilePicture.split('id=')[1];
                if (prevPictureId) await googleapis.deleteFile(prevPictureId, drive);

                const response = {
                    data: user,
                    newAccessToken,
                    error: null
                }

                fs.unlink(saveTo, (err) => err && console.log(err));
                return res.send(response);
            } catch (error: any) {
                return sendHTTPError(res, error.message);
            }
        });

        return req.pipe(bb);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const follow = async (req: Request<{ userId: string }>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { _id: userId } = res.locals.user
    const { userId: whoId } = req.params

    try {

        const isFollowed = await userService.follow(userId, whoId);
        if (!isFollowed) return sendHTTPError(res, 'Invalid request!', 404);

        let followingUsers: Array<UserPost> = []
        let followers: Array<UserPost> = []

        for (const userId of isFollowed.following) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followingUsers = [...followingUsers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        for (const userId of isFollowed.followers) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followers = [...followers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        const user = {
            ...isFollowed,
            following: followingUsers, followers
        }

        const response = {
            data: user,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const changeLikedVideosStatus = async (req: Request<{}, {}, ReqBodyChangeLikedVideoStatus>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { _id: userId } = res.locals.user
    const { newPrivacyStatus } = req.body

    try {

        const updatedUser = await userService.changeLikedVideosStatus(userId, newPrivacyStatus);
        if (!updatedUser) return sendHTTPError(res, 'Invalid request!', 406);

        let followingUsers: Array<UserPost> = []
        let followers: Array<UserPost> = []

        for (const userId of updatedUser.following) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followingUsers = [...followingUsers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        for (const userId of updatedUser.followers) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followers = [...followers, { verified: user.verified, userId: user._id, username: user.username, name: user.name, profile_picture: user.profile_picture }]
            }
        }

        const user = {
            ...updatedUser,
            following: followingUsers, followers
        }

        const response = {
            data: user,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const getUserByUsername = async (req: Request, res: Response): Promise<Response> => {

    const username = req.params.username
    const newAccessToken = res.locals.newAccessToken

    try {

        const user = await userService.findOne({ username });

        const response = {
            data: user,
            newAccessToken,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }

}

export const searchByName = async (req: Request<{}, {}, {}, { keyword: string; page: string; }>, res: Response): Promise<Response> => {

    const newAccessToken = res.locals.newAccessToken
    const { keyword, page } = req.query
    if (!keyword) return sendHTTPError(res, 'Please specify your keyword!', 406);

    try {

        const results = await userService.searchByName(keyword as string, page);

        const SERVER_URL = process.env.SERVER_URL!
        const nextUrl = `${SERVER_URL}/api/v1/user/search?page=${results.currentPage + 1}`;
        const nextURL = results.currentPage >= results.allPage ? null : nextUrl

        const response = {
            data: {
                user: results.user,
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