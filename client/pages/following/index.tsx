import { useState } from "react"

import type { NextPage } from "next"
import Head from "next/head"

import { Content, Header, Leftbar } from "../../components"
import { LoginModal } from "../../components/childs"
import { IUserReducer } from "../../redux/reducers/user.reducer"
import { RootStore } from "../../redux/store"
import { useSelector } from "react-redux"

const Home: NextPage = () => {
  const [openModal, setOpenModal] = useState(false)

  const { user: currentUser } = useSelector(
    (state: RootStore) => state.user
  ) as IUserReducer

  return (
    <div className="m-0 p-0">
      <Head>
        <title>Watch trending videos for you | TikTok</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="description" content="TikTok Clone using Next.js" />
        <meta
          name="description"
          content="TikTok Clone by github.com/NovqiGarrix"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div
        className={`${
          openModal ? "overflow-y-hidden" : ""
        } flex justify-around w-full lg:max-w-5xl lg:mx-auto mt-16`}
      >
        <Leftbar />

        <Content />

        <LoginModal open={openModal} setOpen={setOpenModal} />
      </div>
    </div>
  )
}

export default Home
