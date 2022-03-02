import axios from "axios";
import { UserAndPost } from "../redux/reducers/post.reducer";

const SERVER_URL = process.env.SERVER_URL!;
const API = axios.create({ baseURL: `${SERVER_URL}/api/v1/post/` });

type APIResponse = {
    data: UserAndPost | null;
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

async function getPosts(): Promise<APIResponse> {
    const { data, status } = await API.get(`/following/post`);
    return { ...data, statusCode: status }
}

async function getSystemPosts(): Promise<APIResponse> {
    const systemUserId = '6204818a6d63892af5567270';

    const { data, status } = await API.get(`/?userId=${systemUserId}`);
    return { ...data, statusCode: status }
}

async function getPost(postId: string): Promise<APIResponse> {
    const { data, status } = await API.get(`/${postId}/one`);
    return { ...data, statusCode: status }
}

export default {
    getPosts, getPost, getSystemPosts
}