import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import authService from '../service/auth.service';
import userService from '../service/user.service';

import sendHTTPError from '../util/sendError';
import { ReqBodyLogin, ReqBodyRegister } from '../middleware/authRouteMiddeware'
import jwt from '../util/jwt';


export const login = async (req: Request<{}, {}, ReqBodyLogin>, res: Response): Promise<Response> => {

    const { email, password } = req.body

    try {

        const user = await userService.findOneDatas({ email });
        if (!user) return sendHTTPError(res, 'Invalid email or password!', 403);

        const validPassword = await bcrypt.compare(password, user.password!);
        if (!validPassword) return sendHTTPError(res, 'Invalid email or password!', 403);

        const accessToken = jwt.signToken({ email }, { expiresIn: '15m' });
        const refreshToken = jwt.signToken({ email, _id: user._id }, { expiresIn: '1y' });

        const { password: _, ...rest } = user

        const response = {
            data: { ...rest, accessToken, refreshToken },
            error: null
        }

        return res.send(response);

    } catch (error: any) {
        console.log(error);
        return sendHTTPError(res, error.message);
    }
}

export const register = async (req: Request<{}, {}, ReqBodyRegister>, res: Response): Promise<Response> => {

    try {

        const user = await authService.findOne({ email: req.body.email }, { email: 1 });
        if (user) return res.sendStatus(200);

        await authService.register({ ...req.body, type: req.body.type, isGoogleAccount: false });
        return res.sendStatus(201);

    } catch (error: any) {
        return sendHTTPError(res, error.message);
    }
}