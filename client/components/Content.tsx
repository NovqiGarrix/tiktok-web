import { Dispatch, FunctionComponent, SetStateAction } from "react"
import useGetPosts from "../hooks/useGetPosts"
import { PostPage } from "./childs"

interface IContentPage {
  setOpen: Dispatch<SetStateAction<boolean>>
}

const Content: FunctionComponent<IContentPage> = ({ setOpen }) => {
  const posts = useGetPosts().posts.result

  return (
    <div className="-ml-2 w-10/12 sm:w-full px-3 py-8 lg:max-w-3xl divide-y divide-gray-200 space-y-3 overflow-y-hidden">
      {posts?.map(({ post, user }, key) => (
        <PostPage key={key} user={user} post={post} setOpen={setOpen} />
      ))}
    </div>
  )
}

export default Content
