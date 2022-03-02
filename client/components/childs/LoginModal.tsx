import {
  Dispatch,
  Fragment,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useDispatch, useSelector } from "react-redux"

import { ChevronLeftIcon, XIcon } from "@heroicons/react/outline"
import { Button, ImageButton, Input } from "."
import { loginAction, registerAction } from "../../redux/actions/auth.action"
import axios from "axios"
import { RootStore } from "../../redux/store"
import { IUserReducer } from "../../redux/reducers/user.reducer"

interface ILoginModal {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const LoginModal: FunctionComponent<ILoginModal> = ({ open, setOpen }) => {
  const [signType, setSignType] = useState("login")
  const [whichPage, setWhichPage] = useState(0)
  const [signMethod, setSignMethod] = useState("email")

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
  })
  const [disableLoginButton, setDisableLoginButton] = useState(true)
  const [disableRegisterButton, setDisableRegisterButton] = useState(true)
  const [countryCode, setCountryCode] = useState<string>()
  const [message, setMessage] =
    useState<{ type: string; message: string; messageType: string }>()

  const userState = useSelector(
    (state: RootStore) => state.user
  ) as IUserReducer
  const { registerSuccess, user, error_login, error_register, isLoading } =
    userState

  const cancelButtonRef = useRef(null)
  const dispatch = useDispatch()
  // const router = useRouter()

  const handleSetSignType = (
    type: "login" | "register",
    removeMessage: boolean = true
  ) => {
    setWhichPage(0)
    setSignMethod("email")
    setSignType(type)
    setLoginData({ email: "", password: "" })
    setRegisterData({
      email: "",
      password: "",
      username: "",
      name: "",
    })

    if (removeMessage) setMessage({ type: "", message: "", messageType: "" })
    return
  }

  const handleWithEmail = () => {
    setSignMethod("email")
    setWhichPage(1)
  }

  const handleWithGoogle = () => {
    document.location.href = `https://bit.ly/3gRPMzq`
  }

  const signUpWithEmail = (e: any) => {
    e?.preventDefault()

    dispatch(
      registerAction({ ...registerData, country: countryCode!, type: "user" })
    )
    return
  }

  const signInWithEmail = (e: any) => {
    e?.preventDefault()

    dispatch(loginAction(loginData))
  }

  // Get CountryCode from 3rd party API
  useEffect(() => {
    const getCountryCode = async () => {
      const URL = "https://ipgeolocation.abstractapi.com/v1"
      const API_KEY = process.env.ABSTRACT_API_KEY!

      const { data } = await axios.get(`${URL}?api_key=${API_KEY}`)
      return data
    }

    getCountryCode()
      .then((res) => setCountryCode(res.country_code))
      .catch((err) => console.log({ err }))
  }, [])

  // Check all the register data to turn on the register button
  useEffect(() => {
    const required =
      registerData.email &&
      registerData.password &&
      registerData.name &&
      registerData.username !== ""
    if (!required) {
      if (loginData.password.length > 7) {
        setDisableLoginButton(true)
      }
      return setDisableRegisterButton(true)
    }

    return setDisableRegisterButton(false)
  }, [registerData])

  // Check all the login data to turn on the login button
  useEffect(() => {
    const required = loginData.email && loginData.password !== ""
    if (!required) {
      return setDisableLoginButton(true)
    }

    return setDisableLoginButton(false)
  }, [loginData])

  // Handler when the register process was success
  useEffect(() => {
    if (registerSuccess) {
      setRegisterData({
        email: "",
        password: "",
        username: "",
        name: "",
      })

      handleSetSignType("login", false)
      setWhichPage(1)
      setMessage({
        type: "register",
        message: "Register Success. Check your email to activate your account!",
        messageType: "success",
      })
      return
    }
    if (error_register) {
      setMessage({
        type: "login",
        messageType: "danger",
        message: error_register,
      })
      console.log({ message })
    }
    return
  }, [registerSuccess, error_register])

  // Handler when the login is success
  useEffect(() => {
    if (user && !error_login) {
      setOpen(false)
      setWhichPage(0)
      handleSetSignType("login")
    }

    setMessage({
      type: "register",
      messageType: "danger",
      message: error_login!,
    })
    return
  }, [user, error_login])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            {signType === "login" ? (
              whichPage === 0 ? (
                <div className="inline-block align-bottom relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="p-12 pb-6 ">
                    <div
                      className="close-button absolute top-5 rounded-full right-5 bg-gray-100 p-2 cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      <XIcon className="w-6 h-6 text-gray-800" />
                    </div>

                    <h2 className="text-xl font-poppins font-semibold text-center tracking-wide mb-8">
                      Log in to TikTok
                    </h2>

                    <div className="overflow-x-hidden border-b border-gray-200 pb-2 space-y-2 mb-3">
                      <ImageButton
                        source="/user-circle.png"
                        label="Use Email"
                        onClick={handleWithEmail}
                      />
                      <ImageButton
                        source="/google.png"
                        label="Continue with Google"
                        onClick={handleWithGoogle}
                      />
                    </div>
                  </div>

                  <div className="sticky z-10 bottom-0 border-t w-full flex items-center justify-center">
                    <h3 className="p-5 text-sm tracking-wide font-poppins">
                      Don't have an account?{" "}
                      <span
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleSetSignType("register")}
                      >
                        Sign Up
                      </span>
                    </h3>
                  </div>
                </div>
              ) : (
                whichPage === 1 &&
                signMethod === "email" && (
                  <div className="inline-block align-bottom relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="p-12 pb-6 ">
                      <div
                        className="close-button absolute top-5 rounded-full right-5 bg-gray-100 p-2 cursor-pointer"
                        onClick={() => {
                          setOpen(false)
                          setMessage({ type: "", message: "", messageType: "" })
                        }}
                      >
                        <XIcon className="w-6 h-6 text-gray-800" />
                      </div>
                      <div
                        className="back-button absolute top-5 rounded-full left-5 bg-gray-100 p-2 cursor-pointer"
                        onClick={() => {
                          setMessage({ type: "", message: "", messageType: "" })
                          setWhichPage(0)
                        }}
                      >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-poppins font-semibold text-center tracking-wide mb-1">
                        Log in with Email
                      </h2>
                      {message?.type === "register" && (
                        <h2
                          className={`text-sm font-poppins ${
                            message.messageType === "success"
                              ? "text-green-600"
                              : "text-red-500"
                          } text-center tracking-wide mb-5`}
                        >
                          {message.message}
                        </h2>
                      )}

                      <label
                        htmlFor="email"
                        className="text-sm font-poppins tracking-wide"
                      >
                        Email or username
                      </label>

                      <form onSubmit={signInWithEmail}>
                        <div className="space-y-2 mb-3">
                          <Input
                            label="Email or Username"
                            name="email"
                            onChange={(ev) =>
                              setLoginData({
                                ...loginData,
                                email: ev.target.value,
                              })
                            }
                            type="text"
                            value={loginData.email}
                          />
                          <Input
                            label="Password"
                            name="password"
                            onChange={(ev) =>
                              setLoginData({
                                ...loginData,
                                password: ev.target.value,
                              })
                            }
                            type="password"
                            value={loginData.password}
                            onSubmit={signInWithEmail}
                          />

                          <span className="text-xs text-gray-900 font-semibold cursor-pointer mt-3">
                            Forgot Password?
                          </span>
                        </div>

                        <Button
                          type="submit"
                          label="Log in"
                          disabled={disableLoginButton}
                          isLoading={isLoading}
                        />
                      </form>
                    </div>

                    <div className="sticky z-10 bottom-0 border-t w-full flex items-center justify-center">
                      <h3 className="p-5 text-sm tracking-wide font-poppins">
                        Don't have an account?{" "}
                        <span
                          className="text-red-600 cursor-pointer"
                          onClick={() => setSignType("register")}
                        >
                          Sign Up
                        </span>
                      </h3>
                    </div>
                  </div>
                )
              )
            ) : // Register Session
            whichPage === 0 ? (
              <div className="inline-block align-bottom relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="p-12 pb-6 ">
                  <div
                    className="close-button absolute top-5 rounded-full right-5 bg-gray-100 p-2 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <XIcon className="w-6 h-6 text-gray-800" />
                  </div>

                  <h2 className="text-xl font-poppins font-semibold text-center tracking-wide mb-8">
                    Sign Up for TikTok
                  </h2>

                  <div className="overflow-x-hidden border-gray-200 pb-2 space-y-2 mb-20">
                    <ImageButton
                      source="/user-circle.png"
                      label="Use Email"
                      onClick={handleWithEmail}
                    />
                    <ImageButton
                      source="/google.png"
                      label="Continue with Google"
                      onClick={handleWithGoogle}
                    />
                  </div>

                  <div className="w-full text-center">
                    <p className="text-xs text-gray-600">
                      By continue, you agree to TikTok's{" "}
                      <span className="text-black">Term of Service</span> and
                      confirm that you have read TikTok's{" "}
                      <span className="text-black">Privacy Policy</span>
                    </p>
                  </div>
                </div>

                <div className="sticky z-10 bottom-0 border-t w-full flex items-center justify-center">
                  <h3 className="p-5 text-sm tracking-wide font-poppins">
                    Already have an account?{" "}
                    <span
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleSetSignType("login")}
                    >
                      Log in
                    </span>
                  </h3>
                </div>
              </div>
            ) : (
              whichPage === 1 &&
              signMethod === "email" && (
                <div className="inline-block align-bottom relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="p-12 pb-6 ">
                    <div
                      className="close-button absolute top-5 rounded-full right-5 bg-gray-100 p-2 cursor-pointer"
                      onClick={() => {
                        setOpen(false)
                        setMessage({ type: "", message: "", messageType: "" })
                      }}
                    >
                      <XIcon className="w-6 h-6 text-gray-800" />
                    </div>
                    <div
                      className="back-button absolute top-5 rounded-full left-5 bg-gray-100 p-2 cursor-pointer"
                      onClick={() => {
                        setMessage({ type: "", message: "", messageType: "" })
                        setWhichPage(0)
                      }}
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-poppins font-semibold text-center tracking-wide mb-8">
                      Sign Up with Email
                    </h2>
                    {message?.type === "login" && (
                      <h2
                        className={`text-sm font-poppins ${
                          message.messageType === "success"
                            ? "text-green-600"
                            : "text-red-500"
                        } text-center tracking-wide mb-5`}
                      >
                        {message.message}
                      </h2>
                    )}

                    <label
                      htmlFor="email"
                      className="text-base font-poppins tracking-wide"
                    >
                      Email or username
                    </label>

                    <form onSubmit={signUpWithEmail} method="POST">
                      <div className="space-y-2 mb-3">
                        <Input
                          label="Email"
                          name="email"
                          onChange={(ev) =>
                            setRegisterData({
                              ...registerData,
                              email: ev.target.value,
                            })
                          }
                          type="text"
                          value={registerData.email}
                        />

                        <Input
                          label="Username"
                          name="username"
                          onChange={(ev) =>
                            setRegisterData({
                              ...registerData,
                              username: ev.target.value,
                            })
                          }
                          type="text"
                          value={registerData.username}
                        />

                        <Input
                          label="Full Name"
                          name="fullname"
                          onChange={(ev) =>
                            setRegisterData({
                              ...registerData,
                              name: ev.target.value,
                            })
                          }
                          type="text"
                          value={registerData.name}
                        />

                        <Input
                          label="Password"
                          name="password"
                          onChange={(ev) =>
                            setRegisterData({
                              ...registerData,
                              password: ev.target.value,
                            })
                          }
                          type="password"
                          value={registerData.password}
                        />

                        <span className="text-xs text-gray-900 font-semibold cursor-pointer mt-3">
                          Forgot Password?
                        </span>
                      </div>

                      <Button
                        type="submit"
                        label="Sign up"
                        disabled={disableRegisterButton}
                        isLoading={isLoading}
                      />
                    </form>
                  </div>

                  <div className="sticky z-10 bottom-0 border-t w-full flex items-center justify-center">
                    <h3 className="p-5 text-sm tracking-wide font-poppins">
                      Already have an account?{" "}
                      <span
                        className="text-red-600 cursor-pointer"
                        onClick={() => setSignType("register")}
                      >
                        Log in
                      </span>
                    </h3>
                  </div>
                </div>
              )
            )}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default LoginModal
