// import React from 'react'

// const Spinner = () => {
//   return (
//     <div className='flex items-center justify-center p-8'>
//         <svg className='animate-spin h-6 w-6 text-[#00d492]' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
//             <circle className='opacity-25' cx="12" cy="12" r="10" stroke='currentColor' strokeWidth={3}/>
//             <path className='opacity-75' fill='currentColor' d="M4 12a8 8 0 018-8"/>
//         </svg>
//     </div>
//   )
// }

// export default Spinner




import React from 'react'

const Spinner = () => {
  return (
    <div className='flex items-center justify-center p-8'>
      <div className='h-8 w-8 rounded-full border-4 border-gray-200 border-t-[#00d492] animate-spin'></div>
    </div>
  )
}

export default Spinner

