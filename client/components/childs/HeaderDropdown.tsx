import React, {
  Dispatch,
  Fragment,
  FunctionComponent,
  SetStateAction,
} from "react"

import { Transition } from "@headlessui/react"
import {
  DotsVerticalIcon,
  GlobeAltIcon,
  SpeakerphoneIcon,
  CogIcon,
} from "@heroicons/react/outline"

interface HeaderDropdownProps {
  optionOpen: boolean
  setOptionOpen: Dispatch<SetStateAction<boolean>>
}
const HeaderDropdown: FunctionComponent<HeaderDropdownProps> = ({
  optionOpen,
  setOptionOpen,
}) => {
  const headerOptions = [
    { Icon: GlobeAltIcon, label: "English" },
    { Icon: SpeakerphoneIcon, label: "Feedback and help" },
    { Icon: CogIcon, label: "Keyboard shortcuts" },
  ]

  return (
    <div className="relative">
      <DotsVerticalIcon
        className="w-5 h-5 cursor-pointer"
        aria-hidden="true"
        onClick={() => setOptionOpen((prev) => !prev)}
      />

      <Transition
        show={optionOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute bg-white shadow rounded-md py-2 font-poppins w-60 text-md -right-3 top-8">
          {headerOptions.map((value, key) => (
            <div
              key={key}
              className="px-3 cursor-pointer flex items-center py-2 font-semibold text-gray-600 duration-150 transition-all hover:bg-gray-100"
            >
              <value.Icon className="w-5 h-5 mr-2" />
              {value.label}
            </div>
          ))}
        </div>
      </Transition>
    </div>
  )
}

export default HeaderDropdown
