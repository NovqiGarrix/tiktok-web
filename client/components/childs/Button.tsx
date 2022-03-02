import { FunctionComponent } from "react"
import { RefreshIcon } from "@heroicons/react/outline"

interface IButton {
  label: string
  type: "button" | "submit"
  disabled: boolean
  onClick?: () => void
  isLoading?: boolean
}

const Button: FunctionComponent<IButton> = (props) => {
  const { onClick, label, type, disabled, isLoading } = props

  return (
    <div
      className={`cursor-pointer flex items-center justify-between transition-all ease-out px-4 ${
        disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "cursor-pointer bg-red-500 text-white font-semibold tracking-wide"
      }`}
    >
      <button
        onClick={onClick}
        type={type}
        disabled={disabled}
        className={`w-full flex-grow py-3 rounded font-poppins tracking-wide`}
      >
        {label}
      </button>

      {typeof isLoading === "boolean" && isLoading && (
        <RefreshIcon className="w-5 text-white animate-spin" />
      )}
    </div>
  )
}

export default Button
