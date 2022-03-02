import { Dispatch } from 'redux';

import { signIn, signUp, SingInInput, SingUpInput } from '../../apis/auth.api';
import { CLEAR_POSTS } from '../types/post.types';
import { REQUESTING_USER, SET_USER, REGISTER_USER, FAILED_REGISTER_REQUEST, FAILED_LOGIN_REQUEST } from '../types/user.types';


export const loginAction = (input: SingInInput) => async (dispatch: Dispatch): Promise<void> => {

    dispatch({ type: REQUESTING_USER });
    dispatch({ type: CLEAR_POSTS });

    try {

        const { data, error } = await signIn(input);
        if (error && !data) {
            dispatch({ type: FAILED_LOGIN_REQUEST, payload: error });
            return;
        }

        dispatch({ type: SET_USER, payload: data });
        return;

    } catch (error: any) {
        dispatch({ type: FAILED_LOGIN_REQUEST, payload: error.message });
    }

}

export const registerAction = (input: SingUpInput) => async (dispatch: Dispatch): Promise<void> => {

    dispatch({ type: REQUESTING_USER });

    try {

        const { data, error, statusCode } = await signUp(input);
        if (error && !data) {
            dispatch({ type: FAILED_REGISTER_REQUEST, payload: error });
            return;
        }

        dispatch({ type: REGISTER_USER, payload: statusCode });
        return;

    } catch (error: any) {
        dispatch({ type: FAILED_REGISTER_REQUEST, payload: error.message });
    }

}