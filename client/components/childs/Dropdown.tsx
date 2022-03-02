import { ComponentProps, Fragment, FunctionComponent } from "react"

import { Transition } from "@headlessui/react"
import { LogoutIcon } from "@heroicons/react/outline"

type DropdownContent = {
  Icon: (props: ComponentProps<"svg">) => JSX.Element
  label: string
  onClick: () => void
}

interface HeaderDropdownProps {
  optionOpen: boolean
  dropdownContent: Array<DropdownContent>

  forLogout?: boolean
  logout?: () => void
}
const HeaderDropdown: FunctionComponent<HeaderDropdownProps> = ({
  optionOpen,
  dropdownContent,
  forLogout: isLogout,
  logout,
}) => {
  return (
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
      <div className="absolute bg-white shadow rounded-md py-2 font-poppins w-60 text-md -right-0 top-12">
        <div className="divide-y divide-gray-100 space-y-3 flex flex-col">
          <div>
            {dropdownContent.map((content, key) => (
              <div
                key={key}
                onClick={content.onClick}
                className="px-3 flex items-center py-2 font-semibold text-gray-600 duration-150 transition-all hover:bg-gray-100"
              >
                <content.Icon className="w-5 h-5 mr-2" />
                {content.label}
              </div>
            ))}
          </div>

          {isLogout && (
            <div className="pt-2">
              <div
                onClick={logout}
                className="px-3 flex items-center py-2 font-semibold text-gray-600 duration-150 transition-all hover:bg-gray-100"
              >
                <LogoutIcon className="w-5 h-5 mr-2" />
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </Transition>
  )
}

export default HeaderDropdown
