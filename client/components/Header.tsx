import { FunctionComponent, useEffect, useState } from "react"

import Link from "next/link"
import Image from "next/image"

import { useRouter } from "next/router"

import {
  SearchIcon,
  CloudUploadIcon,
  InboxIcon,
  UserIcon,
} from "@heroicons/react/outline"
import { Dropdown, HeaderDropdown } from "./childs"
import useGetUser from "../hooks/useGetUser"
import { useDispatch } from "react-redux"

import { CLEAR_USER } from "../redux/types/user.types"
import { CLEAR_POSTS } from "../redux/types/post.types"

interface HeaderProps {}
const Header: FunctionComponent<HeaderProps> = (props) => {
  const [optionOpen, setOptionOpen] = useState(false)

  const dispatch = useDispatch()
  const router = useRouter()

  const currentUser = useGetUser().user

  const dropdownContent = [
    {
      Icon: UserIcon,
      label: "Profile",
      onClick: () => router.replace(`/${currentUser?.username}`),
    },
  ]

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    dispatch({ type: CLEAR_USER })
    dispatch({ type: CLEAR_POSTS })

    document.location.href = "/"
  }

  return (
    <header className="border-b border-gray-300 shadow-sm py-2 px-5 w-full fixed top-0 left-0 bg-white z-10">
      <div className="flex items-center justify-between w-full lg:max-w-5xl mx-auto">
        {/* Left */}
        <div
          className="w-28 mt-1 cursor-pointer"
          onClick={() => router.replace("/")}
        >
          <Image
            src="/logo.svg"
            width={1920}
            height={500}
            objectFit="cover"
            alt="TikTok"
          />
        </div>

        {/* Middle */}
        <div className="hidden md:flex px-5 py-3 md:w-3/6 lg:w-3/6 xl:w-2/5 items-center bg-gray-100 justify-between rounded-full border border-gray-100">
          <form className="w-full font-poppins space-x-5 divide-gray-300 divide-x font-bold flex justify-between items-center">
            <input
              type="text"
              className="pr-3 text-sm flex-grow bg-transparent outline-none border-0 placeholder-gray-400 text-gray-400"
              placeholder="Search accounts and videos"
            />

            <div className="pl-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
          </form>
        </div>

        {/* Right */}
        {currentUser ? (
          <div className="flex items-center space-x-5">
            <div className="cursor-pointer">
              <CloudUploadIcon className="w-6 h-6" />
            </div>
            <div className="cursor-pointer">
              <InboxIcon className="w-6 h-6" />
            </div>
            <div className="group-scope cursor-pointer relative">
              <div
                className="w-9 h-9"
                onClick={() => setOptionOpen((prev) => !prev)}
              >
                <Image
                  src={currentUser.profile_picture ?? "/illenium.jpg"}
                  width={1000}
                  height={1000}
                  alt={currentUser.username}
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>

              <Dropdown
                optionOpen={optionOpen}
                dropdownContent={dropdownContent}
                forLogout
                logout={logout}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center sm:w-52 sm:justify-between lg:w-1/5">
            <Link passHref href="/">
              <a className="hidden transition-all duration-150 sm:block text-gray-700 font-semibold font-poppins hover:underline sm:text-sm md:text-md">
                Upload
              </a>
            </Link>

            <button className="mr-1 sm:mr-0 py-2 px-8 bg-red-500 text-sm font-poppins text-white font-semibold rounded ">
              Log in
            </button>

            <HeaderDropdown
              optionOpen={optionOpen}
              setOptionOpen={setOptionOpen}
            />
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
