import axios from "axios";
import { UserResponse } from './user.api';

const SERVER_URL = process.env.SERVER_URL!
const API = axios.create({ baseURL: `${SERVER_URL}/api/v1/auth` });


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

    if(newAccessToken) localStorage.setItem('access_token', newAccessToken);
    return res

}, (error) => Promise.reject(error.message));

export type SingInInput = { 
    email: string;
    password: string;
}
export async function signIn(input: SingInInput): Promise<UserResponse> {
    const { data, status } = await API.post('/', input);
    return { ...data, statusCode: status }
}

export type SingUpInput = { 
    email: string;
    password: string;
    username: string;
    name: string;
    country: string;
    type: 'user' | 'admin';
}
export async function signUp(input: SingUpInput): Promise<UserResponse> {
    const { data, status } = await API.post('/signUp', input);
    return { ...data, statusCode: status }
}