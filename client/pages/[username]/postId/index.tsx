import { useEffect, useState } from "react"
import { NextPage } from "next"
import { useRouter } from "next/router"
import Image from "next/image"

import { Header, Leftbar } from "../../../components"
import { LockClosedIcon } from "@heroicons/react/outline"
import { useSelector } from "react-redux"
import { RootStore } from "../../../redux/store"

const ProfilePage: NextPage = (props) => {
  const [profileTab, setProfileTab] = useState(0)
  const [profileHoverTav, setProfileHoverTav] = useState(0)

  const router = useRouter()

  return (
    <div className="p-0 m-0">
      <Header />

      <div
        className={`flex justify-around w-full lg:max-w-5xl lg:mx-auto mt-16`}
      >
        {/* <Leftbar /> */}
      </div>
    </div>
  )
}

export default ProfilePage
