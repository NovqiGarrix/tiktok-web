import { AnyAction, Reducer } from 'redux';
import { REQUESTING_USER, FAILED_LOGIN_REQUEST, FAILED_REGISTER_REQUEST, SET_USER, REGISTER_USER, SET_GOOGLE_USER, FAILED_REQUESTING_USER, CLEAR_USER, FOLLOW_USER } from '../types/user.types';
import { IPost, UserPost } from './post.reducer';

export type Verified = 0 | 1;
export type ShowLikedVideos = 'true' | 'false';
export type Role = 1 | 2;
export type UserType = 'admin' | 'user';

export interface IUser {
    _id: string;
    username: string; // required
    name: string; // required
    email: string; // required
    password?: string; // required
    type: UserType; // required
    role: Role;
    country: string;
    profile_picture: string;
    following: Array<UserPost> | []; // userId
    followers: Array<UserPost> | []; // userId
    bio: string;
    likes: number;
    verified: Verified;
    videos: Array<IPost> | []; // postId
    liked: Array<IPost> | []; // postId
    showLikedVideos: ShowLikedVideos;
    isGoogleAccount: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IUserReducer {
    user: IUser | null;
    error: string | null;
    error_login: string | null;
    error_register: string | null;
    isLoading: boolean;
    registerSuccess: boolean;
}

const initialState: IUserReducer = {
    user: null, error_login: null, error_register: null, isLoading: false, registerSuccess: false, error: null
}

const userReducer: Reducer = (state: IUserReducer = initialState, action: AnyAction): IUserReducer => {

    switch (action.type) {
        case REQUESTING_USER:
            return { ...state, isLoading: true }

        case FAILED_REGISTER_REQUEST:
            return { ...state, isLoading: false, error_register: action.payload, registerSuccess: false }

        case FAILED_LOGIN_REQUEST:
            return { ...state, isLoading: false, error_login: action.payload, registerSuccess: false }

        case FAILED_REQUESTING_USER:
            return { ...state, isLoading: false, error: action.payload }

        case REGISTER_USER:
            const statusCode = action.payload;
            const registerStatus = statusCode === 201

            return { ...state, isLoading: false, error_register: null, registerSuccess: registerStatus }

        case SET_USER:
            return { ...state, isLoading: false, error_login: null, user: action.payload }

        case SET_GOOGLE_USER:
            return { ...state, isLoading: false, error_login: null, user: action.payload }

        case FOLLOW_USER:
            return { ...state, isLoading: false, error: null, user: { ...state.user!, ...action.payload } }

        case CLEAR_USER:
            return { ...state, isLoading: false, error: null, user: null }

        default:
            return state;
    }

}

export default userReducer