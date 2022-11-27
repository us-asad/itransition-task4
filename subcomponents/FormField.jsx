import React, { useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function FormField({
  type,
  registers = {},
  label,
  placeholder,
  className,
  inputClassName,
  error,
  defaultValue
}) {
  const inputProps = {
    type,
    placeholder,
    defaultValue,
    className: `w-full px-3 py-2.5 border-2 rounded-md text-[18px] mt-0.5 ${error ? "border-red-600" : "border-purple-700"} ${inputClassName}`,
    ...registers
  }
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className={`flex flex-col ${className}`}>
      {label ? <span className='text-[14px]'>{label}:</span> : null}
      {{
        password: (
          <div className='relative'>
            <input {...inputProps} type={showPassword ? "text" : "password"} />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute top-[4px] right-[3px] w-[50px] h-[89%] flex items-center justify-center bg-white rounded-lg text-[25px]"
            >
              {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
            </button>
          </div>
        )
      }[type] || (
          <input
            {...inputProps}
          />
        )}
      {error ? <span className='text-[14px] text-red-600'>{error}</span> : null}
    </label>
  )
}
