import { FilterQuery } from "mongoose";
import CommentModel, { IComment } from "../model/comment.model";
import PostModel, { AllowComment, IPost, PostPrivacy } from "../model/posts.model";
import UserModel, { UserReturn } from "../model/user.model";






async function countAllData(): Promise<number> {
    return await PostModel.find().count();
}

async function getPost(filter: FilterQuery<IPost>): Promise<IPost | null> {
    return await PostModel.findOne(filter).lean();
}

async function getPosts(filter?: FilterQuery<IPost>, limit: number = 10, skip: number = 0): Promise<Array<IPost>> {
    return filter ? await PostModel.find(filter).skip(skip).limit(limit).lean() : await PostModel.find().skip(skip ? skip : 0).limit(limit ? limit : 10).lean();
}

async function uploadPost(userId: string, post: { fileId: string; desc: string; country: string, privacy: PostPrivacy, title: string }): Promise<IPost> {
    const videoURL = `https://drive.google.com/uc?id=${post.fileId}`;

    const newPost = await PostModel.create({
        desc: post.desc, file: videoURL, country: post.country, userId, likes: 0, privacy: post.privacy, title: post.title
    });

    return {
        _id: newPost._id.toString(),
        userId,
        file: newPost.file,
        title: newPost.title,
        desc: newPost.desc,
        country: newPost.country,
        likes: newPost.likes,
        comments: newPost.comments,
        allowComment: newPost.allowComment,
        privacy: newPost.privacy,
        viewed: newPost.viewed,
        createdAt: newPost.createdAt.toString(),
        updatedAt: newPost.updatedAt.toString()
    }
}

async function changePrivacy(postId: string, newPrivacy: PostPrivacy): Promise<IPost | null> {

    const prevPost = await PostModel.findByIdAndUpdate(postId, { privacy: newPrivacy }).lean();
    if (prevPost) {
        return {
            ...prevPost,
            privacy: newPrivacy
        }
    }

    return null

}

async function changeAllowCommenting(postId: string, allowComment: AllowComment): Promise<IPost | null> {

    const prevPost = await PostModel.findByIdAndUpdate(postId, { allowComment }).lean();

    if (prevPost) {
        return {
            ...prevPost,
            allowComment
        }
    }

    return null

}

async function addComment(input: Omit<IComment, '_id' | 'createdAt' | 'updatedAt'>): Promise<IComment> {

    const comment = await CommentModel.create(input);
    const relatedPost = await PostModel.findById(input.postId).lean();

    await PostModel.updateOne({ _id: input.postId }, { comments: [...relatedPost?.comments!, comment._id] });

    return {
        _id: comment._id.toString(),
        userId: comment.userId,
        postId: comment.postId,
        replyTo: comment.replyTo,
        comment: comment.comment,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
    }

}

async function deletePost(postId: string): Promise<boolean> {
    const deletedPost = await PostModel.deleteOne({ _id: postId }).lean();
    if (deletedPost.deletedCount) return true;

    return false;
}

export type LikePostReturn = { post: IPost, user: UserReturn }
async function likePost(userId: string, postId: string): Promise<LikePostReturn | null> {

    const relatedPost = await PostModel.findById(postId).lean();
    if (!relatedPost) return null;

    const user = await UserModel.findById(userId).lean();
    if (!user) return null;

    await UserModel.updateOne({ _id: userId }, { liked: [...user.liked, postId] });
    await PostModel.updateOne({ _id: postId }, { likes: relatedPost.likes + 1 })

    return {
        post: {
            ...relatedPost,
            _id: relatedPost._id.toString(),
            likes: relatedPost.likes + 1
        },

        user: {
            ...user,
            _id: user._id.toString(),
            liked: [...user.liked, postId]
        }
    }

}

export type UnLikePostReturn = { post: IPost, user: UserReturn }
async function unLikePost(userId: string, postId: string): Promise<UnLikePostReturn | null> {

    const user = await UserModel.findById(userId).lean();
    if (!user) return null;

    const relatedPost = await PostModel.findById(postId).lean();
    if (!relatedPost) return null;

    await UserModel.updateOne({ _id: userId }, { liked: user.liked.filter((likedPost) => likedPost.toString() !== postId.toString()) });
    await PostModel.updateOne({ _id: postId }, { likes: relatedPost.likes > 0 ? relatedPost.likes - 1 : 0 })

    return {
        post: {
            ...relatedPost,
            _id: relatedPost._id.toString(),
            likes: relatedPost.likes > 0 ? relatedPost.likes - 1 : 0 // 0 - 1 = 0
        },

        user: {
            ...user,
            _id: user._id.toString(),
            liked: user.liked.filter((likedPost) => likedPost.toString() !== postId.toString())
        }
    }
}

async function searchByName(keyword: string, page: string | undefined): Promise<{ post: Array<IPost>, allPage: number, currentPage: number }> {

    let currentPage = page ? Number(page) : 1
    const limit = 10

    async function search(withLimit: boolean = true, limit: number = 10, skip: number = 0): Promise<Array<IPost>> {
        if (withLimit) {
            return await PostModel.find({ $text: { $search: keyword } }).skip(skip).limit(limit).lean();
        }

        return await PostModel.find({ $text: { $search: keyword } }).lean();
    }

    const allPosts = (await search(false)).length

    const isModulo = allPosts % limit === 0
    const allPage = isModulo ? Math.floor(allPosts / limit) : (Math.floor(allPosts / limit)) + 1

    if (currentPage - 1 < 1) {
        currentPage = 1
    }

    const skip = (currentPage - 1) * limit

    const posts = await search(true, 10, skip);
    return {
        post: posts,
        allPage, currentPage
    }
}

async function searchByTag(tag: string, page: string | undefined): Promise<{ post: Array<IPost>, allPage: number, currentPage: number }> {

    let currentPage = page ? Number(page) : 1
    const limit = 10

    async function search(withLimit: boolean = true, limit: number = 10, skip: number = 0): Promise<Array<IPost>> {
        if (withLimit) {
            return await PostModel.find({ $text: { $search: `${tag}` } }).skip(skip).limit(limit).lean();
        }

        return await PostModel.find({ $text: { $search: `${tag}` } }).lean();
    }

    const allPosts = (await search(false)).length

    const isModulo = allPosts % limit === 0
    const allPage = isModulo ? Math.floor(allPosts / limit) : (Math.floor(allPosts / limit)) + 1

    if (currentPage - 1 < 1) {
        currentPage = 1
    }

    const skip = (currentPage - 1) * limit

    const posts = await search(true, 10, skip);
    return {
        post: posts,
        allPage, currentPage
    }
}

async function addPostLike(videoId: string): Promise<{ videoId: string; viewed: number } | null> {

    const post = await PostModel.findById(videoId)
    if (!post) return null

    await PostModel.updateOne({ _id: post._id }, { viewed: post.viewed + 1 });

    return {
        videoId: post._id,
        viewed: post.viewed + 1
    }
}

async function getFollowingPosts(following: Array<string>): Promise<Array<IPost>> {

    let posts: Array<IPost> = []

    for (const followingId of following) {
        const post = await getPosts({ userId: followingId }, 5);
        if (post) posts = [...posts, ...post]
    }

    posts.sort((a, b) => {
        const aCreatedAt = new Date(a.createdAt).getTime();
        const bCreatedAt = new Date(b.createdAt).getTime();

        return aCreatedAt - bCreatedAt
    })

    return posts
}

async function addPostView(postId: string): Promise<{ postId: string; viewed: number } | null> {

    const post = await PostModel.findById(postId).lean();
    if (!post) return null

    await PostModel.updateOne({ _id: post._id }, { viewed: post.viewed + 1 })

    return {
        postId: post._id,
        viewed: post.viewed + 1
    }
}

export default {
    getPost, getPosts, uploadPost,
    changePrivacy, changeAllowCommenting,
    addComment, deletePost, likePost, unLikePost,
    countAllData, searchByName, addPostLike, getFollowingPosts,
    searchByTag, addPostView
}