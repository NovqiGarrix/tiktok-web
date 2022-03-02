import { Dispatch, Fragment, FunctionComponent, SetStateAction } from "react"
import { useRouter } from "next/router"

import Link from "next/link"
import Image from "next/image"

import { HomeIcon, UsersIcon } from "@heroicons/react/solid"
import {
  HomeIcon as HomeIconOutline,
  UsersIcon as UsersIconOutline,
  CheckCircleIcon,
  MusicNoteIcon,
  SearchIcon,
  HashtagIcon,
} from "@heroicons/react/outline"
import { Badget } from "./childs"
import { useSelector } from "react-redux"
import { RootStore } from "../redux/store"
import { IUserReducer } from "../redux/reducers/user.reducer"

interface ILeftBar {
  setModalOpen: Dispatch<SetStateAction<boolean>>
}

const Leftbar: FunctionComponent<ILeftBar> = ({ setModalOpen }) => {
  const router = useRouter()

  const { user: currentUser } = useSelector(
    (state: RootStore) => state.user
  ) as IUserReducer

  const leftMenus = [
    {
      ActiveIcon: HomeIcon,
      UnActiveIcon: HomeIconOutline,
      label: "For You",
      isActive: router.pathname === "/",
      onClick: () => router.push("/"),
    },
    {
      ActiveIcon: UsersIcon,
      UnActiveIcon: UsersIconOutline,
      label: "Following",
      isActive: router.pathname === "/following",
      onClick: () => router.push("/following"),
    },
  ]

  return (
    <div className="relative w-3/12 sm:w-1/12 lg:w-5/12 xl:w-6/12 ">
      <div className="fixed w-16 lg:w-72 xl:w-80 border-r lg:border-0 border-gray-200 h-screen flex flex-col divide-gray-100 divide-y space-y-5">
        <div className="flex flex-col items-center justify-between pt-5 space-y-5 pb-2 relative">
          {leftMenus.map((menu, key) => (
            <Fragment key={key}>
              {menu.isActive ? (
                <div
                  onClick={menu.onClick}
                  className="cursor-pointer transition-all duration-150 font-poppins lg:flex lg:w-full items-center space-x-3 lg:hover:bg-gray-50 px-3 lg:py-2 lg:rounded"
                >
                  <menu.ActiveIcon className="w-7 h-7 text-red-500" />
                  <h3 className="hidden font-bold text-[18px] text-red-500 lg:block">
                    {menu.label}
                  </h3>
                </div>
              ) : (
                <div
                  onClick={menu.onClick}
                  className="cursor-pointer transition-all duration-150 font-poppins lg:flex lg:w-full items-center space-x-3 lg:hover:bg-gray-50 px-3 lg:py-2 lg:rounded"
                >
                  <menu.UnActiveIcon className="w-7 h-7" />
                  <h3 className="hidden font-bold text-[18px] lg:block">
                    {menu.label}
                  </h3>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {!currentUser && (
          <div className="pl-3 hidden lg:block pt-5 font-poppins space-y-4">
            <h4 className="text-sm text-gray-400">
              Log in follow creators, like videos, and view comments.
            </h4>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex py-3 text-sm items-center justify-center border text-red-500 font-bold border-red-500 rounded hover:bg-red-50"
            >
              Log in
            </button>
          </div>
        )}

        <div className="flex flex-col items-center lg:items-start pt-5 px-3">
          {currentUser && currentUser.following.length > 0 ? (
            <Fragment>
              <h4 className="hidden lg:inline-block text-gray-500 text-sm font-medium font-poppins lg:mb-3">
                Following Accounts
              </h4>
              {currentUser.following.map((user, key) => (
                <div
                  key={key}
                  className="lg:w-full lg:flex items-center hover:bg-gray-50 px-3 rounded transition-all duration-150 cursor-pointer"
                >
                  <div className="w-12 h-12 p-2 lg:w-13 lg:h-13 hover:bg-gray-100 rounded">
                    <Image
                      src={user.profile_picture ?? "/illenium.jpg"}
                      width={1000}
                      height={1000}
                      objectFit="cover"
                      loading="lazy"
                      className="rounded-full"
                    />
                  </div>

                  <div className="hidden lg:flex flex-col">
                    <p className="font-bold font-poppins flex items-center space-x-1">
                      <span>{user.username}</span>
                      {user.verified === 1 && (
                        <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                      )}
                    </p>
                    <small className="text-xs">{user.name}</small>
                  </div>
                </div>
              ))}

              <Link passHref href="/artist">
                <a className="hidden text-sm mt-3 lg:block text-red-500 font-poppins font-semibold hover:underline transition-all duration-150 px-3">
                  See all
                </a>
              </Link>
            </Fragment>
          ) : (
            <h3 className="text-sm text-gray-400">
              Every people you follow, will appear here
            </h3>
          )}
        </div>

        <div className="pl-5 font-poppins py-5 hidden lg:block">
          <h4 className="text-sm text-gray-400 font-medium mb-5">Discover</h4>

          <div className="discover flex flex-wrap">
            <Badget Icon={HashtagIcon} label="illenium2021" />
            <Badget Icon={SearchIcon} label="ILLENIUM 2021" />
            <Badget
              Icon={MusicNoteIcon}
              label="ILLENIUM and Natalie Taylor - Fragment"
            />
            <Badget Icon={HashtagIcon} label="illenium2021" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leftbar
