import React from 'react'

const PassOP = (params) => {
    return (
        <div className={`${params.txt_color ? params.txt_color : "text-white"} font-bold ${params.txt_color ? params.txt_size : ""} `}><span className="text-green-600">&lt;</span>Pass<span className="text-green-600">OP&gt;</span></div>
    )
}

export default PassOP
