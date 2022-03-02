import { writeFile, readFile } from 'fs/promises';

import { GoogleApis, NewToken } from '../util/googleapis';
import { UserReturn } from '../model/user.model';
import jwt from '../util/jwt';
import authService from './auth.service';
import userService from './user.service';
import { GoogleApisClient } from '../util/googleapis.client';

function generateAuthURL(): string {
    const SCOPE = ['https://www.googleapis.com/auth/drive', 'profile', 'email'];
    const oAuthClient = GoogleApis.getOAuthClient();
    const authURL = oAuthClient.generateAuthUrl({ access_type: 'offline', scope: SCOPE });
    return authURL
}

function generateAuthURLForClient(): string {
    const SCOPE = ['profile', 'email'];
    const oAuthClient = GoogleApisClient.getOAuthClient();
    const authURL = oAuthClient.generateAuthUrl({ access_type: 'offline', scope: SCOPE });
    return authURL
}

async function storeToken(code: string, path: string): Promise<void> {
    const oAuthClient = GoogleApis.getOAuthClient();

    const { tokens } = await oAuthClient.getToken(code);

    const token = {
        ...tokens,
        expires_at: Date.now() + 3480 * 1000 // Next 58 minutes.
    }
    await writeFile(path, JSON.stringify(token));
}

async function storeNewAccessToken(path: string): Promise<NewToken | null> {
    let credentials = JSON.parse((await readFile(path)).toString())!;
    const newToken = await new GoogleApis().getNewAccessToken(credentials.refresh_token);
    await writeFile(path, JSON.stringify(newToken));
    return newToken
}

type LoginOrSignUpReturn = Promise<UserReturn & { accessToken: string, refreshToken: string } | null>
async function loginOrSignUp(input: { email: string; locale: string; picture: string, name: string }): LoginOrSignUpReturn {

    const { email, locale, picture, name } = input

    // Username, email, and name -> Required
    let isExistUser = await authService.findOne({ email, isGoogleAccount: true });

    const country = locale.toUpperCase();
    if (isExistUser) {
        isExistUser = await userService.updateOne({ email, isGoogleAccount: true }, { name, country, profile_picture: picture }) as UserReturn

        const accessToken = jwt.signToken({ email }, { expiresIn: '15m' });
        const refreshToken = jwt.signToken({ email, _id: isExistUser._id }, { expiresIn: '1y' });

        return {
            ...isExistUser,
            accessToken, refreshToken
        }
    }

    // Count all the user that register with google
    const allGoogleUsers = await userService.countAllGoogleUser();
    const username = `${name.replaceAll(' ', '_').toLowerCase()}$${allGoogleUsers + 1}`;

    const user = await authService.registerWithGoogle({
        username, email, name, country, profile_picture: picture, isGoogleAccount: true
    })

    const accessToken = jwt.signToken({ email }, { expiresIn: '15m' });
    const refreshToken = jwt.signToken({ email, _id: user._id }, { expiresIn: '1y' });

    return {
        ...user,
        accessToken, refreshToken
    }

}

export default {
    generateAuthURL, storeToken, storeNewAccessToken, loginOrSignUp,
    generateAuthURLForClient
}