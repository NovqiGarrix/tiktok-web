import { Dispatch } from 'redux';

import userApi from '../../apis/user.api';
import { REQUESTING_USER, FAILED_REQUESTING_USER, SET_USER, FOLLOW_USER } from '../types/user.types';




export const getCurrentUser = () => async (dispatch: Dispatch) => {

    dispatch({ type: REQUESTING_USER });

    try {

        const { data, error } = await userApi.getCurrentUser();
        if (error) {
            console.log({ error });
            dispatch({ type: FAILED_REQUESTING_USER, payload: error });
            return;
        }

        dispatch({ type: SET_USER, payload: data });
    } catch (error: any) {
        dispatch({ type: FAILED_REQUESTING_USER, payload: error.message })
    }

}

export const followUser = (userId: string) => async (dispatch: Dispatch) => {

    dispatch({ type: REQUESTING_USER });

    try {

        const { data, error } = await userApi.followUser(userId);
        if (error) {
            dispatch({ type: FAILED_REQUESTING_USER, payload: error })
            return
        }

        dispatch({ type: FOLLOW_USER, payload: data })
        return

    } catch (error: any) {
        dispatch({ type: FAILED_REQUESTING_USER, payload: error.message })
    }

}