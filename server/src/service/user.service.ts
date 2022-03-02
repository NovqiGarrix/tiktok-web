import { FilterQuery, UpdateQuery } from 'mongoose';

import UserModel, { ShowLikedVideos, User, UserReturn } from "../model/user.model";
import jwt from '../util/jwt';

type CreateUserParams = Omit<User, '_id' | 'following' | 'followers' | 'likes' | 'verified' | 'videos' | 'liked' | 'showLikedVideos' | 'createdAt' | 'updatedAt'>
async function createUser(user: CreateUserParams): Promise<UserReturn> {

    const newUser = await UserModel.create(user);

    return {
        _id: newUser._id.toString(),
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
        role: newUser.role,
        country: newUser.country,
        profile_picture: newUser.profile_picture,
        following: newUser.following,
        followers: newUser.followers,
        bio: newUser.bio,
        likes: newUser.likes,
        verified: newUser.verified,
        videos: newUser.videos,
        liked: newUser.liked,
        showLikedVideos: newUser.showLikedVideos,
        isGoogleAccount: newUser.isGoogleAccount,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
    }

}

async function createUserForGoogleUser(user: Omit<CreateUserParams, 'password' | 'role' | 'type'>): Promise<UserReturn> {

    const newUser = await UserModel.create({ ...user, role: 2, type: 'user' });

    return {
        _id: newUser._id.toString(),
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
        role: newUser.role,
        country: newUser.country,
        profile_picture: newUser.profile_picture,
        following: newUser.following,
        followers: newUser.followers,
        bio: newUser.bio,
        likes: newUser.likes,
        verified: newUser.verified,
        videos: newUser.videos,
        liked: newUser.liked,
        showLikedVideos: newUser.showLikedVideos,
        isGoogleAccount: newUser.isGoogleAccount,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
    }

}

// Password is not include
async function findOne(filter: FilterQuery<User>, projection?: Record<string, number>): Promise<UserReturn | undefined> {
    return await UserModel.findOne(filter, projection).lean();
}

// Pass is include
async function findOneDatas(filter: FilterQuery<User>, projection?: Record<string, number>): Promise<User | undefined> {
    return await UserModel.findOne(filter, projection).lean();
}

async function findById(_id: string, projection?: Record<string, number>): Promise<UserReturn | undefined> {
    return await UserModel.findById(_id, projection).lean();
}

async function countAllUser(): Promise<number> {
    return await UserModel.find().count();
}

async function countAllGoogleUser(): Promise<number> {
    return await UserModel.find({ isGoogleAccount: true }).count();
}

async function finds(filter: FilterQuery<User>, limit: number = 10, skip: number = 0, projection?: Record<string, number>): Promise<Array<UserReturn>> {
    return await UserModel.find(filter, projection).skip(skip).limit(limit).lean();
}

async function updateOne(filter: FilterQuery<User>, updateQuery: UpdateQuery<User>): Promise<UserReturn | null> {

    const user = await UserModel.findOneAndUpdate(filter, updateQuery).lean();
    if (user) return { ...user, ...updateQuery }

    return null
}

async function reIssueAccessToken(email: string): Promise<string> {

    try {

        return jwt.signToken({ email }, { expiresIn: '15m' });

    } catch (error: any) {
        return "ERROR!"
    }

}

async function updateBio(userId: string, newBio: string): Promise<UserReturn | null> {
    const user = await UserModel.findOneAndUpdate({ _id: userId }, { bio: newBio }).lean();
    if (user) return { ...user, bio: newBio, _id: user._id.toString() }

    return null
}

async function updateProfilePicture(userId: string, fileId: string): Promise<UserReturn | null> {

    const profile_picture = `https://drive.google.com/thumbnail?id=${fileId}`;

    const user = await UserModel.findByIdAndUpdate(userId, { profile_picture }).lean();
    if (user) return {
        ...user, profile_picture
    }

    return null
}

async function follow(userId: string, whoId: string): Promise<UserReturn | null> {

    // Get the current user and add the following
    const user = await UserModel.findById(userId).lean();
    if (!user) return null;


    // Get the whoId user and add the followers
    const whoIdUser = await UserModel.findById(whoId).lean();
    if (!whoIdUser) return null;

    await UserModel.updateOne({ _id: whoId }, { followers: [...whoIdUser.followers, userId] });
    await UserModel.updateOne({ _id: userId }, { following: [...user.following, whoId] });

    const updatedUser = await UserModel.findById(user._id).lean();
    if (!updatedUser) return null;

    return {
        ...updatedUser,
        _id: updatedUser._id.toString()
    }
}

async function changeLikedVideosStatus(userId: string, newStatus: ShowLikedVideos): Promise<User | null> {

    const user = await UserModel.findByIdAndUpdate(userId, { showLikedVideos: newStatus }).lean();
    if (!user) return null;

    return {
        ...user,
        _id: user._id.toString(),
        showLikedVideos: newStatus
    }

}

async function updateUsername(userId: string, newUsername: string): Promise<UserReturn | null> {

    const user = await UserModel.findByIdAndUpdate(userId, { username: newUsername }).lean();
    if (!user) return null;

    return {
        ...user,
        username: newUsername
    }

}

async function searchByName(keyword: string, page: string | undefined): Promise<{ user: Array<UserReturn>, allPage: number, currentPage: number }> {

    let currentPage = page ? Number(page) : 1
    const limit = 10

    async function search(withLimit: boolean = true, limit: number = 10, skip: number = 0): Promise<Array<UserReturn>> {
        if (withLimit) {
            return await UserModel.find({ $text: { $search: keyword } }).skip(skip).limit(limit).lean();
        }

        return await UserModel.find({ $text: { $search: keyword } }).lean();
    }

    const allPosts = (await search(false)).length

    const isModulo = allPosts % limit === 0
    const allPage = isModulo ? Math.floor(allPosts / limit) : (Math.floor(allPosts / limit)) + 1

    if (currentPage - 1 < 1) {
        currentPage = 1
    }

    const skip = (currentPage - 1) * limit

    const users = await search(true, 10, skip);
    return {
        user: users,
        allPage, currentPage
    }
}

export default {
    createUser, findOne, findById,
    reIssueAccessToken, findOneDatas, updateOne,
    finds, updateBio, updateProfilePicture, follow,
    changeLikedVideosStatus, countAllUser, createUserForGoogleUser,
    countAllGoogleUser, updateUsername, searchByName
}