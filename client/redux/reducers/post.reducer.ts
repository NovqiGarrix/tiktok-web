import { AnyAction, Reducer } from 'redux';
import { REQUESTING_POSTS, FAILED_REQUESTING_POSTS, SET_POSTS, CLEAR_POSTS } from '../types/post.types';

export type Verified = 0 | 1;
export type ShowLikedVideos = 'true' | 'false';
export type Role = 1 | 2;
export type UserType = 'admin' | 'user';

export type UserPost = { userId: string; username: string; name: string; profile_picture: string; verified: number }

export type UserAndPost = {
    result: Array<{ user: UserPost, post: IPost }> | null;
    allPage: number;
    page: number;
    nextURL: string;
}

export interface IPost {
    _id: string;

    userId: string; // required
    file: string; // required
    title: string;
    desc: string; // required
    country: string; // required
    likes: number; // required
    privacy: string; // required
    viewed: number;
    allowComment: string;
    comments: Array<string>

    createdAt: string;
    updatedAt: string;
}

export interface IPostReducer {
    posts: UserAndPost;
    error: string | null;
    isLoading: boolean;
}

const initialState: IPostReducer = {
    posts: { allPage: 1, nextURL: '', page: 1, result: null }, isLoading: false, error: null
}

const postReducer: Reducer = (state: IPostReducer = initialState, action: AnyAction): IPostReducer => {

    switch (action.type) {
        case REQUESTING_POSTS:
            return { ...state, isLoading: true }

        case FAILED_REQUESTING_POSTS:
            return { ...state, isLoading: false, error: action.payload }

        case SET_POSTS:
            return { ...state, isLoading: false, posts: { ...state.posts, ...action.payload } }

        // case SET_POST:
        //     return {  }

        case CLEAR_POSTS:
            return { ...state, isLoading: false, posts: { allPage: 1, nextURL: '', page: 1, result: null } }

        default:
            return state;
    }

}

export default postReducer