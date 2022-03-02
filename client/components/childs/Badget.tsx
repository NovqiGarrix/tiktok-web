import { ComponentProps, FunctionComponent } from 'react';

interface Badget {
    Icon: (props: ComponentProps<'svg'>) => JSX.Element;
    label: string;
}
const Badget: FunctionComponent<Badget> = ({ Icon, label }) => {

    return (
        <div className="mb-2 mr-2 flex items-center space-x-2 py-1 px-2 border border-gray-300 box-border rounded-full hover:bg-gray-100 duration-150 transition-all cursor-pointer" style={{ width: 'fit-content' }}>
            <Icon className="w-4 h-4 text-gray-700" />
            <small className="text-gray-400 text-xs">{label}</small>
        </div>
    )
}

export default Badget