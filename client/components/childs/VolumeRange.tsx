import { FunctionComponent } from 'react';

interface VolumeRangeProps {
    setValue: (newValue: number) => void;
}

const VolumeRange: FunctionComponent<VolumeRangeProps> = ({ setValue }) => {

    return (
        <div className="group-scope-hover:block hover:block absolute bottom-14 -right-2">
            <input onChange={(ev) => setValue(Number(ev.target.value) / 100)} type="range" className="volume-range w-12 transform -rotate-90" />
        </div>
    )
}

export default VolumeRange