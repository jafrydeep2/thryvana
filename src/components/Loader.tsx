import React from 'react'

function Loader({ text = 'Loading your goals...' }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute top-1 left-1 w-14 h-14 border-4 border-t-transparent border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
            </div>
            <p className="mt-4 text-muted-foreground">{text}</p>
        </div>
    )
}

export default Loader