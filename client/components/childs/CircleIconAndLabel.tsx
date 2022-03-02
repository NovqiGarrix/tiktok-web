import { ComponentProps, FunctionComponent } from 'react';


interface CircleIconAndLabelProps {
    Icon: (props: ComponentProps<'svg'>) => JSX.Element;
    label: string
}
const CircleIconAndLabel: FunctionComponent<CircleIconAndLabelProps> = ({ Icon, label }) => {

    return (
        <div className="text-center">
            <div className="relative p-2 flex items-center justify-center group w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 shadow-sm hover:bg-gray-200 duration-150 transition-all cursor-pointer">
                <Icon className="w-6 h-6" />
            </div>

            <span className="font-medium font-poppins text-xs select-none">{label}</span>
        </div>
    )
}

export default CircleIconAndLabel