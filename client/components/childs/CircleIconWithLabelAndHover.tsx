import { ComponentProps, FunctionComponent, useState } from "react"

import Image from "next/image"

import { Transition } from "@headlessui/react"

interface CircleIconWithLabelAndHoverProps {
  Icon: (props: ComponentProps<"svg">) => JSX.Element
  hoverComponent: Array<{
    imageSrc: string
    title: string
    onClick: () => void
  }>
  label: string
}
const CircleIconWithLabelAndHover: FunctionComponent<
  CircleIconWithLabelAndHoverProps
> = ({ Icon, hoverComponent, label }) => {
  return (
    <div className="text-center group-scope relative">
      <div className="relative p-2 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 shadow-sm hover:bg-gray-200 duration-150 transition-all cursor-pointer">
        <Icon className="w-6 h-6" />
      </div>

      <span className="font-medium font-poppins text-xs">{label}</span>
      <div className="hidden absolute bg-white shadow-md rounded-lg py-2 w-64 -top- -left-7 group-scope-hover:block">
        {hoverComponent.map((prop, key) => (
          <div
            key={key}
            onClick={prop.onClick}
            className="flex px-4 py-2 cursor-pointer items-center space-x-3 hover:bg-gray-100 transition duration-150"
          >
            <div className="w-6 h-6">
              <Image
                src={prop.imageSrc}
                width={1000}
                height={1000}
                alt="illneium"
                objectFit="cover"
              />
            </div>
            <h6 className="font-poppins leading-3 font-medium text-base text-gray-800">
              {prop.title}
            </h6>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CircleIconWithLabelAndHover
