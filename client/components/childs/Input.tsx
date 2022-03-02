import {
  ChangeEvent,
  FormEvent,
  Fragment,
  FunctionComponent,
  HTMLInputTypeAttribute,
  useState,
} from "react";

import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

type InputProps = {
  type: HTMLInputTypeAttribute;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
  value: string;
  onSubmit?: (ev: FormEvent<HTMLInputElement>) => void;
  autoComplete?: boolean;
};

const Input: FunctionComponent<InputProps> = (props) => {
  let {
    type,
    onChange,
    label,
    name,
    value,
    onSubmit,
    autoComplete = false,
  } = props;

  const [passwordOn, setPasswordOn] = useState(true);
  const [inputType, setInputType] = useState(type);

  const changePassowrdVisibility = () => {
    if (passwordOn) {
      setPasswordOn((prev) => !prev);
      setInputType("text");
      return;
    }

    setPasswordOn((prev) => !prev);
    setInputType("password");
    return;
  };

  return (
    <Fragment>
      {type !== "password" ? (
        <input
          type={type}
          onChange={onChange}
          placeholder={label}
          name={name}
          value={value}
          onSubmit={onSubmit}
          autoComplete={`${autoComplete}`}
          id={name}
          className="flex-grow text-sm outline-none py-3 pl-4 rounded-l font-poppins w-full font-normal text-gray-900 rounded bg-gray-100 focus:bg-gray-50 border-2 border-gray-200 transition-all duration-150"
        />
      ) : (
        <div className="flex items-center pr-3 rounded-l font-poppins w-full font-normal bg-gray-100 focus-within:bg-gray-50 text-gray-900 rounded bg-none border-2 border-gray-200">
          <input
            type={inputType}
            onChange={onChange}
            placeholder={label}
            name={name}
            value={value}
            onSubmit={onSubmit}
            autoComplete={`${autoComplete}`}
            id={name}
            className="flex-grow text-sm outline-none bg-gray-100 focus:bg-gray-50 py-3 pl-4"
          />

          <div
            className="bg-none cursor-pointer"
            onClick={changePassowrdVisibility}
          >
            {passwordOn ? (
              <EyeOffIcon className="w-5 text-gray-400" />
            ) : (
              <EyeIcon className="w-5 text-gray-400" />
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Input;
