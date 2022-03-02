import { OAuth2Client } from 'google-auth-library';
import { drive_v3, google } from 'googleapis';
import { readFile } from 'fs/promises';
import { createReadStream } from 'fs';
import axios from 'axios'
import dotnev from 'dotenv';

dotnev.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string

const BASE_URL = process.env.BASE_URL!
const REDIRECT_URI = `${BASE_URL}/api/v1/google/callback`;

export type UploadFileReturn = {
    kind: string;
    id: string;
    name: string;
    mimeType: string;
}

export type NewToken = {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    id_token: string;
    expires_in: number;
    expires_at: number;
}

export type DriveUserType = 'user' | 'group' | 'domain' | 'anyone'
export type DriveUserRole = 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader'

export class GoogleApis {
    public static oAuthClient: OAuth2Client
    public static oAuthClientForClient: OAuth2Client

    public static getOAuthClient(): OAuth2Client {

        if (GoogleApis.oAuthClient) return GoogleApis.oAuthClient
        return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    }

    async getNewAccessToken(refresh_token: string): Promise<NewToken | null> {
        const host = 'https://oauth2.googleapis.com';
        const data = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token,
            grant_type: 'refresh_token'
        }

        const { data: response } = await axios.post(`${host}/token`, data);

        const { refresh_token: prev_refresh_token } = JSON.parse((await readFile('./google-credentials.json')).toString());
        if (!prev_refresh_token) return null;

        return {
            ...response,
            refresh_token: prev_refresh_token,
            expires_at: Date.now() + 3480 * 1000 // Next 58 minutes.
        }
    }

    static getDrive(oAuthClient: OAuth2Client): drive_v3.Drive {
        return google.drive({ version: 'v3', auth: oAuthClient });
    }

    async uploadFile(file_name: string, mime_type: string, saveTo: string, folderId: string, drive: drive_v3.Drive): Promise<drive_v3.Schema$File> {

        const { data } = await drive.files.create({
            requestBody: {
                name: file_name,
                mimeType: mime_type,
                parents: [folderId]
            },

            media: {
                mimeType: mime_type, body: createReadStream(saveTo)
            }
        });

        return data
    }

    async updateFilePrivacy(fileId: string, role: DriveUserRole, type: DriveUserType, drive: drive_v3.Drive): Promise<drive_v3.Schema$Permission> {

        const { data } = await drive.permissions.create({
            fileId, requestBody: {
                role, type
            }
        })

        return data
    }

    async deleteFile(fileId: string, drive: drive_v3.Drive): Promise<void> {
        await drive.files.delete({ fileId });
    }


}