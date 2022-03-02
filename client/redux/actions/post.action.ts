import { Dispatch } from 'redux';
import { REQUESTING_POSTS, FAILED_REQUESTING_POSTS, SET_POSTS } from '../types/post.types';
import postsApi from '../../apis/posts.api';




export const getPosts = () => async (dispatch: Dispatch) => {

    dispatch({ type: REQUESTING_POSTS });

    const { data, error } = await postsApi.getPosts();

    if (error) {
        dispatch({ type: FAILED_REQUESTING_POSTS, payload: error })
        return
    }

    dispatch({ type: SET_POSTS, payload: data })
    return

}

export const getSystemPosts = () => async (dispatch: Dispatch) => {

    dispatch({ type: REQUESTING_POSTS });

    const { data, error } = await postsApi.getSystemPosts();

    if (error) {
        dispatch({ type: FAILED_REQUESTING_POSTS, payload: error })
        return
    }

    dispatch({ type: SET_POSTS, payload: data })
    return

}