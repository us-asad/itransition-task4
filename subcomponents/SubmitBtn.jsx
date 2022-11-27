import React from 'react'
import Spinner from './Spinner'

export default function SubmitBtn({ text, loadingText, className, loading, disabled, onClick = Function.prototype, loadingClassName }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full px-3 py-2.5 flex items-center justify-center gap-2 bg-purple-700 text-white rounded-md text-[18px] font-medium group ${className} ${disabled || loading ? "opacity-60 pointer-events-none" : ""}`}
    >
      <span className='group-hover:scale-105 group-active:scale-95 inline-block duration-200'>
        {loading ? loadingText || text : text}
      </span>
      {loading ? <Spinner className={loadingClassName} /> : null}
    </button>
  )
}
