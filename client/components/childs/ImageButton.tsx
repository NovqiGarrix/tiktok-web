import { FunctionComponent } from 'react';
import Image from 'next/image';

interface IImageButton {
    source: string;
    label: string;
    onClick: () => void
}

const ImageButton: FunctionComponent<IImageButton> = ({ source, label, onClick }) => {

    return (
        <button className='flex items-center  border rounded-sm p-2 w-full outline-none' onClick={onClick}>
            <div className='w-10 px-1 pr-2 pt-1 border-r'>
                <Image
                    src={source}
                    width={1080}
                    height={1080}
                    objectFit='cover'
                />
            </div>

            <div className='flex items-center justify-center w-full'>
                <h4 className='text-center align-middle font-poppins font-medium text-sm tracking-wide'>{label}</h4>
            </div>
        </button>
    )
}

export default ImageButton