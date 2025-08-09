import React from 'react'
import PassOP from './PassOP'

const Navbar = () => {
    return (
        <>
            <nav className='bg-blue-950 flex justify-between py-2 px-10' >
                <PassOP/>
                <div className="text-white">GitHub</div>
            </nav>
        </>
    )
}

export default Navbar
