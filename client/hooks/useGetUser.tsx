import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getCurrentUser } from "../redux/actions/user.action"
import { IUserReducer } from "../redux/reducers/user.reducer"
import { RootStore } from "../redux/store"

const useGetUser = () => {
  const userState = useSelector(
    (state: RootStore) => state.user
  ) as IUserReducer
  let currentUser = userState.user

  const dispatch = useDispatch()

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token")

    if (!refreshToken) {
      currentUser = null
      return
    }

    if (!currentUser) {
      dispatch(getCurrentUser())
      return
    }
  }, [currentUser])

  return userState
}

export default useGetUser
