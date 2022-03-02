import { useEffect, useState } from "react"
import { NextPage } from "next"
import { useRouter } from "next/router"
import Image from "next/image"

import { Header, Leftbar } from "../../components"
import { LockClosedIcon } from "@heroicons/react/outline"
import { IUser, IUserReducer } from "../../redux/reducers/user.reducer"
import userApi from "../../apis/user.api"
import { useSelector } from "react-redux"
import { RootStore } from "../../redux/store"
import { LoginModal } from "../../components/childs"

interface IProfilePage {
  data: IUser | null
}

const ProfilePage: NextPage<IProfilePage> = (props) => {
  const [profileTab, setProfileTab] = useState(0)
  const [profileHoverTav, setProfileHoverTav] = useState(0)
  const [user, setUser] = useState<IUser | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const router = useRouter()
  const { user: currentUser } = useSelector(
    (state: RootStore) => state.user
  ) as IUserReducer

  useEffect(() => {
    const username = router.query.username as string

    const fetchUser = async () => {
      const { data, error } = await userApi.getUserByUsername(username)
      if (error) console.warn({ error })
      return data
    }

    if ((currentUser && currentUser.username !== username) || !currentUser) {
      fetchUser()
        .then((user) => setUser(user))
        .catch((err) => console.log({ err }))
    }
  }, [])

  return (
    <div className="p-0 m-0">
      <Header />
      <LoginModal setOpen={setOpenModal} open={openModal} />

      <div
        className={`flex justify-around w-full lg:max-w-5xl lg:mx-auto mt-16`}
      >
        <Leftbar setModalOpen={setOpenModal} />

        <div className="-ml-2 w-10/12 sm:w-full px-3 py-8 lg:max-w-3xl">
          <div className="py-3 space-y-5">
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-5 mb-1">
                <div className="w-32 h-32">
                  <Image
                    src={currentUser?.profile_picture ?? "/illenium.jpg"}
                    width={1000}
                    height={1000}
                    alt={currentUser?.username || user?.username}
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>

                <div className="flex flex-col font-poppins">
                  <h4 className="text-2xl font-bold">
                    {currentUser?.username || user?.username}
                  </h4>
                  <span className="text-base font-normal">
                    {currentUser?.name || user?.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-5 font-poppins">
                <div className="flex space-x-2 items-center">
                  <span className="text-base font-bold">
                    {currentUser?.following.length ||
                      user?.following.length ||
                      0}
                  </span>
                  <p className="text-sm font-normal text-gray-500">Following</p>
                </div>

                <div className="flex space-x-2 items-center">
                  <span className="text-base font-bold">
                    {currentUser?.followers.length ||
                      user?.followers.length ||
                      0}
                  </span>
                  <p className="text-sm font-normal text-gray-500">Followers</p>
                </div>

                <div className="flex space-x-2 items-center">
                  <span className="text-base font-bold">
                    {currentUser?.likes || user?.likes || 0}
                  </span>
                  <p className="text-sm font-normal text-gray-500">Likes</p>
                </div>
              </div>

              <span className="text-sm text-gray-600 font-normal font-poppins">
                {currentUser?.bio || user?.bio}
              </span>
            </div>

            <div>
              <div className="relative">
                <div className="flex font-poppins items-center w-full mb-1">
                  <div
                    onClick={() => setProfileTab(0)}
                    onMouseOver={() => setProfileHoverTav(0)}
                    onMouseLeave={() => setProfileHoverTav(profileTab)}
                    className={`w-full justify-center flex items-center transition-all cursor-pointer`}
                  >
                    <h5
                      className={`text-lg font-semibold ${
                        profileTab === 0 ? "text-black" : "text-gray-500"
                      }`}
                    >
                      Videos
                    </h5>
                  </div>

                  <div
                    onClick={() => setProfileTab(1)}
                    onMouseOver={() => setProfileHoverTav(1)}
                    onMouseLeave={() => setProfileHoverTav(profileTab)}
                    className={`w-full justify-center flex space-x-2 items-center transition-all duration-150 cursor-pointer`}
                  >
                    <LockClosedIcon
                      className={`w-5 h-5 ${
                        profileTab === 1 ? "text-black" : "text-gray-500"
                      }`}
                    />
                    <h5
                      className={`text-lg font-semibold ${
                        profileTab === 1 ? "text-black" : "text-gray-500"
                      }`}
                    >
                      Liked
                    </h5>
                  </div>
                </div>
                <div
                  className={`relative border-b-2 transition duration-300 ease-in-out border-black w-1/2 transform ${
                    profileHoverTav === 0 ? "translate-x-0" : "translate-x-full"
                  }`}
                ></div>
                <div className="absolute border-b border-gray-300 w-full" />
              </div>

              <div className="grid grid-cols-3 gap-1">
                {/* Small Video :( */}

                {profileTab === 0 ? (
                  <div className="w-full">
                    <video
                      itemID="yobl3b7898923b9237d"
                      muted={true}
                      className="w-full h-72 cursor-pointer object-cover rounded"
                      src={`https://drive.google.com/uc?id=1vrlLEmKQFA_bJ3Cj-R3KZoX3WUIMIa-o`}
                      onVolumeChange={(ev) =>
                        console.log(ev.currentTarget.volume)
                      }
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <video
                      itemID="yobl3b7898923b9237d"
                      muted={true}
                      className="w-full h-72 cursor-pointer object-cover rounded"
                      src={`https://drive.google.com/uc?id=1vrlLEmKQFA_bJ3Cj-R3KZoX3WUIMIa-o`}
                      onVolumeChange={(ev) =>
                        console.log(ev.currentTarget.volume)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
