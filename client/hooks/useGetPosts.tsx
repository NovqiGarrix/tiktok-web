import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getPosts, getSystemPosts } from "../redux/actions/post.action"
import { IPostReducer } from "../redux/reducers/post.reducer"
import { RootStore } from "../redux/store"

const useGetPosts = () => {
  const postState = useSelector(
    (state: RootStore) => state.post
  ) as IPostReducer
  let posts = postState.posts.result

  const dispatch = useDispatch()

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token")

    if (!refreshToken) {
      dispatch(getSystemPosts())
      return
    }

    dispatch(getPosts())
  }, [posts?.length])

  return postState
}

export default useGetPosts
