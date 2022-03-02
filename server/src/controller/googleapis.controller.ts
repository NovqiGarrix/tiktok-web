import { Request, Response } from 'express';
import { ReqBodyGoogleLogin } from '../middleware/googleRoute';
import authService from '../service/auth.service';

import googleapisService from '../service/googleapis.service';
import userService from '../service/user.service';
import { GoogleApisClient } from '../util/googleapis.client';
import jwt from '../util/jwt';
import sendHTTPError from '../util/sendError';
import { UserPost } from './user.controller';

export const generateAuthURL = async (_req: Request, res: Response): Promise<Response> => {

    try {

        const authURL = await googleapisService.generateAuthURL();

        const response = {
            data: authURL,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const generateAuthURLForClient = async (_req: Request, res: Response): Promise<Response> => {

    try {

        const authURL = googleapisService.generateAuthURLForClient();

        const response = {
            data: authURL,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const handleCallback = async (req: Request, res: Response): Promise<Response> => {

    const code = req.query.code as string;

    try {

        await googleapisService.storeToken(code, './google-credentials.json');
        return res.sendStatus(200);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}

export const loginOrSignUp = async (req: Request<{}, {}, ReqBodyGoogleLogin>, res: Response): Promise<Response> => {

    const { code } = req.body

    try {

        const oAuthClient = GoogleApisClient.getOAuthClient();

        const { tokens: { id_token } } = await oAuthClient.getToken(code);
        if (!id_token) return sendHTTPError(res, 'Invalid request!', 406);

        const { data } = jwt.decodeToken<{ email: string, name: string, locale: string, picture: string }>(id_token);
        if (!data) return sendHTTPError(res, 'Invalid request!', 406);

        const existedEmail = await authService.findOne({ email: data.email, isGoogleAccount: false });
        if (existedEmail) return sendHTTPError(res, 'Your account have been registered using email', 406);

        const newUser = await googleapisService.loginOrSignUp(data);
        if (!newUser) return sendHTTPError(res, 'Invalid request!', 406);

        let followingUsers: Array<UserPost> | [] = []
        let followers: Array<UserPost> | [] = []

        for (const userId of newUser.following) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followingUsers = [...followingUsers, { userId: user._id.toString(), name: user.name, username: user.username, profile_picture: user.profile_picture, verified: user.verified }]
            }
        }

        for (const userId of newUser.followers) {
            if (userId) {
                const user = await userService.findById(userId);
                if (user) followers = [...followers, { userId: user._id.toString(), name: user.name, username: user.username, profile_picture: user.profile_picture, verified: user.verified }]
            }
        }

        const user = {
            ...newUser,
            following: followingUsers, followers
        }

        const response = {
            data: user,
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}