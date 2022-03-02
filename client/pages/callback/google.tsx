import { FunctionComponent, useEffect } from "react"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import Head from "next/head"

import { decodeBase64 } from "../../utils/base64"
import { IUser } from "../../redux/reducers/user.reducer"
import { SET_GOOGLE_USER } from "../../redux/types/user.types"
import { CLEAR_POSTS } from "../../redux/types/post.types"
import { followUser } from "../../redux/actions/user.action"

const GoogleCallback: FunctionComponent = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    const data = router.query.data as string

    if (data) {
      const { accessToken, refreshToken, ...user } = JSON.parse(
        decodeBase64(data)
      ) as IUser & { accessToken: string; refreshToken: string }

      dispatch({ type: SET_GOOGLE_USER, payload: user })
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)
      dispatch({ type: CLEAR_POSTS })

      const todo = localStorage.getItem("todo")
      if (todo) {
        const parsedTodo = JSON.parse(todo) as {
          user: { _id: string; username: string }
          todo: "follow"
        }
        const { user, todo: todo_ } = parsedTodo

        switch (todo_) {
          case "follow":
            dispatch(followUser(user._id))
            router.replace(`/${user.username}`)
            return

          default:
            break
        }
      }

      router.push(`/${user.username}`)
      return
    }

    router.replace("/")
    return () => {}
  }, [router.query?.data])

  return (
    <Head>
      <title>Loading...</title>
    </Head>
  )
}

export default GoogleCallback
