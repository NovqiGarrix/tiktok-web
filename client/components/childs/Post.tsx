import {
  FunctionComponent,
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  Fragment,
} from "react"

import Image from "next/image"

import {
  VolumeUpIcon,
  VolumeOffIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/outline"
import { HeartIcon, ShareIcon, ChatIcon } from "@heroicons/react/solid"
import { CircleIconAndLabel, CircleIconWithLabelAndHover } from "../childs"
import VolumeRange from "./VolumeRange"
import { useSelector, useDispatch } from "react-redux"
import { RootStore } from "../../redux/store"
import { IUserReducer } from "../../redux/reducers/user.reducer"
import {
  IPost,
  IPostReducer,
  UserPost,
} from "../../redux/reducers/post.reducer"
import { followUser } from "../../redux/actions/user.action"

interface IPostPage {
  post: IPost
  user: UserPost
  setOpen: Dispatch<SetStateAction<boolean>>
}

const PostPage: FunctionComponent<IPostPage> = ({ post, user, setOpen }) => {
  const [isVideoPlay, setIsVideoPlay] = useState(true)
  const [isMuted, setIsMuted] = useState(false)

  const dispatch = useDispatch()

  const { user: currentUser } = useSelector(
    (state: RootStore) => state.user
  ) as IUserReducer

  const {
    posts: { result: posts },
  } = useSelector((state: RootStore) => state.post) as IPostReducer

  const videoRef = useRef<HTMLVideoElement>(null)

  const shares = [
    {
      imageSrc: "/wa-logo.png",
      title: "Share to Whatsapp",
      onClick: () => console.log("Share to Whatsapp"),
    },
    {
      imageSrc: "/fb-logo.png",
      title: "Share to Facebook",
      onClick: () => console.log("Share to Facebook"),
    },
  ]

  const onStopClick = () => {
    videoRef.current?.pause()
    setIsVideoPlay(false)
  }

  const onPlayClick = () => {
    videoRef.current?.play()
    setIsVideoPlay(true)
  }

  const setVolume = (newVolume: number) => {
    if (videoRef.current?.volume && newVolume !== 0) {
      videoRef.current.volume = newVolume
    }
  }

  const onMuteClick = () => setIsMuted(true)
  const onUnMuteClick = () => setIsMuted(false)

  const followAUser = (userId: string) => {
    if (!currentUser) {
      setOpen(true)
      localStorage.setItem(
        "todo",
        JSON.stringify({
          todo: "follow",
          user: { _id: user.userId, username: user.username },
        })
      )
    }

    dispatch(followUser(userId))
  }

  const showFollow = (): boolean => {
    if (currentUser) {
      const isFollowed =
        currentUser.following.find(
          ({ userId }) => userId.toString() === user.userId.toString()
        ) !== undefined
      return currentUser.username !== user.username && !isFollowed
    }

    return false
  }

  console.log(showFollow())

  useEffect(() => {
    const isPlayed = videoRef.current?.played

    if (!isPlayed) {
      videoRef.current?.play()
    }
  }, [videoRef.current])

  return (
    <div className="py-3">
      <div className="flex items-center justify-between w-full mb-5 sm:-mb-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-14 sm:h-14">
            <Image
              src={user.profile_picture ?? "/illenium.jpg"}
              alt={user.profile_picture}
              width={1000}
              height={1000}
              objectFit="cover"
              loading="lazy"
              className="rounded-full"
            />
          </div>
          <p className="flex flex-col lg:flex-row lg:flex-wrap lg:items-center lg:space-x-1">
            <span className="font-bold font-poppins text-gray-800">
              {user.username}
            </span>
            <small className="text-xs font-poppins">{user.name}</small>
          </p>
        </div>

        {showFollow() && (
          <Fragment>
            <button
              style={{ padding: "1px 1.25rem" }}
              className="font-medium text-[16px] font-poppins border text-red-500 border-red-500 rounded hover:bg-red-50"
              onClick={() => followAUser(user.userId)}
            >
              Follow
            </button>
          </Fragment>
        )}
      </div>

      <div className="sm:flex">
        <div className="hidden sm:block w-10 h-10 sm:w-14 sm:h-14 mr-3"></div>
        <div>
          <div className="font-poppins text-sm overflow-ellipsis whitespace-nowrap overflow-hidden w-full mb-2">
            {post.title}
            <span className="font-semibold">#nextjs </span>
            <span className="font-semibold">#typescript</span>
          </div>

          <div className="w-full flex flex-row items-end space-x-2 md:space-x-5 group">
            <div className="relative">
              <video
                itemID={post._id}
                ref={videoRef}
                muted={isMuted}
                onClick={isVideoPlay ? onStopClick : onPlayClick}
                className="cursor-pointer max-w-xs rounded"
                src={post.file}
                autoPlay={posts![0].post._id.toString() === post._id.toString()}
                loop
                height={1920}
                width={1080}
              />

              <span className="absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 duration-150 ease-in-out transition cursor-pointer">
                {isVideoPlay ? (
                  <StopIcon
                    onClick={onStopClick}
                    className="w-7 h-7 text-white"
                  />
                ) : (
                  <PlayIcon
                    onClick={onPlayClick}
                    className="w-7 h-7 text-white"
                  />
                )}
              </span>
              <div className="absolute bottom-5 flex flex-col items-end group-scope right-5 opacity-0 group-hover:opacity-100 duration-150 ease-in-out transition cursor-pointer delay-75">
                {isMuted ? (
                  <div className="relative">
                    <VolumeRange setValue={setVolume} />
                    <VolumeOffIcon
                      onClick={onUnMuteClick}
                      className="w-7 h-7 text-white"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <VolumeRange setValue={setVolume} />
                    <VolumeUpIcon
                      onClick={onMuteClick}
                      className="w-7 h-7 text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-col flex space-y-3">
              <CircleIconAndLabel Icon={HeartIcon} label="491K" />
              <CircleIconAndLabel Icon={ChatIcon} label="4533" />
              <CircleIconWithLabelAndHover
                Icon={ShareIcon}
                label="2547"
                hoverComponent={shares}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostPage
