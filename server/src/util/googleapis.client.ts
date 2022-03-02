import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import dotnev from 'dotenv';

dotnev.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID_FOR_CLIENT as string
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET_FOR_CLIENT as string

const CLIENT_URL = process.env.CLIENT_URL!
const REDIRECT_URI = `${CLIENT_URL}/api/google/callback`;

export class GoogleApisClient {
    public static oAuthClient: OAuth2Client

    public static getOAuthClient(): OAuth2Client {
        if (GoogleApisClient.oAuthClient) return GoogleApisClient.oAuthClient
        return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    }

}