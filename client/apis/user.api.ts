import axios from "axios";

import { IUser } from '../redux/reducers/user.reducer'

const SERVER_URL = process.env.SERVER_URL!;
const API = axios.create({ baseURL: `${SERVER_URL}/api/v1/user/` });

export type UserResponse = {
    data: IUser | null;
    error: any | null;
    statusCode: number;
}

// Before requesting
API.interceptors.request.use((config) => {

    const accessToken = localStorage.getItem('access_token')!;
    const refreshToken = localStorage.getItem('refresh_token')!;

    config.headers = {
        ...config.headers,
        'x-access-token': accessToken,
        'x-refresh-token': refreshToken
    }

    return config

}, ((error) => Promise.reject(error.message)));


// After response
API.interceptors.response.use((res) => {

    const { data } = res
    const newAccessToken = data?.newAccessToken

    if (newAccessToken) localStorage.setItem('access_token', newAccessToken);
    return res

}, (error) => Promise.reject(error.message));


async function getCurrentUser(): Promise<UserResponse> {
    const { data, status } = await API.get(`/`);
    return { ...data, statusCode: status }
}

async function getUserByUsername(username: string): Promise<UserResponse> {
    const { data, status } = await API.get(`/${username}/one`);
    return { ...data, statusCode: status }
}

async function followUser(userId: string): Promise<UserResponse> {

    const { data, status } = await API.post(`/${userId}/follow`);
    return { ...data, statusCode: status }

}

export default {
    getCurrentUser, getUserByUsername, followUser
}