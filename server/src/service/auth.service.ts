import bcrypt from 'bcryptjs';

import userService from './user.service';
import { Role, User, UserReturn } from '../model/user.model';

const { findOne, createUser, createUserForGoogleUser } = userService

export type RegisterParams = Omit<User, '_id' | 'verified' | 'profile_picture' | 'following' | 'showLikedVideos' | 'followers' | 'bio' | 'likes' | 'videos' | 'liked' | 'createdAt' | 'updatedAt' | 'role'>
async function register(userData: RegisterParams): Promise<UserReturn> {

    const hashPassword = await bcrypt.hash(userData.password!, 12);

    let role: Role;

    switch (userData.type) {
        case 'admin':
            role = 1
            break;

        default:
            role = 2
            break;
    }

    const profile_picture = `https://ui-avatars.com/api?name=${userData.name}&background=000&color=fff`

    const newUser = {
        ...userData,
        profile_picture,
        bio: 'No Bio yet'
    }

    const user = await createUser({ ...newUser, password: hashPassword, role });
    return user
}

async function registerWithGoogle(userData: Omit<RegisterParams, 'password' | 'type'> & { profile_picture: string }): Promise<UserReturn> {

    const newUser = {
        ...userData,
        bio: 'No Bio yet'
    }

    const user = await createUserForGoogleUser({ ...newUser });
    return user
}

export default { register, findOne, registerWithGoogle }