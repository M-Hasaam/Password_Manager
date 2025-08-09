import { React, useState, useEffect, useRef, use } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from "uuid";

import PassOP from './PassOP'
import eyeon from "../assets/eye-on.svg"
import eyeof from "../assets/eye-off.svg"

const Main = () => {

    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [TableData, setTableData] = useState([])

    // useEffect(() => {
    //     fetch('http://localhost:3000/passwords')
    //         .then(res => res.json())
    //         .then(data => setTableData(data))
    //         .catch(() => notify({ string: "Failed to load data", sign: false }));

    //     // console.log(TableData.map(row => row.id));

    // }, []);
    const [serverDown, setServerDown] = useState(false);

    const notifiedRef = useRef(false); // prevents duplicate notifications

    useEffect(() => {
        const checkServer = () => {
            fetch("http://localhost:3000/passwords")
                .then(res => {
                    if (!res.ok) throw new Error("Server error");
                    return res.json();
                })
                .then(data => {
                    setTableData(data);
                    setServerDown(false);

                    if (serverDown) { // was previously down
                        if (!notifiedRef.current) {
                            notify({ string: "Server connection restored", sign: true });
                            notifiedRef.current = true;
                        }
                    }
                })
                .catch(() => {
                    setServerDown(true);
                    setTableData({});
                    notifiedRef.current = false; // allow reconnect notification next time
                });
        };

        checkServer(); // initial check
        const intervalId = setInterval(checkServer, 5000);
        return () => clearInterval(intervalId);
    }, [serverDown]);

    const [Eye, setEye] = useState(true)

    const notify = (param) => {
        const baseOptions = {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            theme: "dark",
            icon: param.sign ? "✅" : "❌",
        };

        if (param.sign) {
            toast.success(param.string, baseOptions);
        } else {
            toast.error(param.string, baseOptions);
        }
    };

    const HandleSave = async () => {
        if (!(form.password.length == 0 || form.site.length == 0 || form.username.length == 0)) {

            fetch('http://localhost:3000/passwords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setTableData([...TableData, { ...form }]);
                        notify({ string: "Successfully Saved!", sign: true });

                        setform({ site: "", username: "", password: "" })

                        console.log(TableData)
                    }

                    // console.log(TableData.map(row => row.id))
                    // console.log(TableData)
                })
        }
        else {
            notify({ string: "Complete The Form!", sign: false });
            console.log(TableData)
        }

        // console.log(TableData)
    };

    const HandleChange = (e) => {
        const { name, value } = e.target

        setform((prev) => ({
            ...prev,
            [name]: value,
        })
        )
    }

    const copyText = (text) => {
        toast('Copied to clipboard!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
        navigator.clipboard.writeText(text)
    }

    const HandleDelete = (row) => {
        console.log(row)
        if (confirm("Are You Sure To Delete This"))
            fetch('http://localhost:3000/passwords', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(row),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setTableData(prev => prev.filter(_row => _row._id !== row._id));
                        notify({ string: "Deleted Successfully!", sign: true });
                    } else {
                        notify({ string: "Delete failed", sign: false });
                    }
                })
    }

    const HandleEdit = (_id) => {
        console.log(_id)
        const RowToEdit = TableData.find((row) => row._id === _id)
        if (RowToEdit) {
            setform(RowToEdit)
            setTableData((prev) => { return prev.filter((row) => { return row._id !== _id }) })
        }
    }

    return (
        <>
            {serverDown && (
                <div className="fixed top-0 left-0 w-full bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base font-semibold shadow-lg z-[9999] flex items-center justify-center animate-pulse rounded-b-md">
                    <span className="mr-2 text-lg sm:text-xl">🚨</span>
                    <span className="truncate">Failed to connect to server — retrying...</span>
                </div>
            )}



            <div className="bg-green-100  min-h-[84vh] py-3">
                <ToastContainer />
                <div className="mx-auto my-[30px] w-2/3 py-2  flex flex-col text-center justify-center">
                    <div className="">
                        <PassOP txt_color="text-black" txt_size="text-2xl" />
                        <div className="text-[15px]">Your own Password Manager</div>
                    </div>
                    <form className="flex flex-col gap-3 mt-1  mb-5 text-[15px]">
                        <input
                            type="text"
                            name="site"
                            placeholder="Website URL"
                            value={form.site}
                            onChange={HandleChange}
                            className=" border rounded-full bg-white px-2"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={HandleChange}
                                className=" border rounded-full w-3/4 bg-white px-2"
                            />
                            <div className="relative w-1/4">
                                <input
                                    type={Eye ? "password" : "text"}
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={HandleChange}
                                    className="border rounded-full w-full bg-white px-2 pr-8" // pr-8 to leave space for icon
                                />
                                <img
                                    src={Eye ? eyeon : eyeof}
                                    onClick={() => { setEye(!Eye) }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[20px] cursor-pointer"
                                    alt="Eye On"
                                />
                            </div>



                        </div>
                    </form>
                    <button onClick={HandleSave} className=' flex justify-center items-center cursor-pointer bg-green-500 border border-black font-bold text-[10px] w-fit mx-auto rounded-full px-[15px] py-0.5'>
                        <lord-icon
                            src="https://cdn.lordicon.com/jgnvfzqg.json"
                            trigger="hover" >
                        </lord-icon>
                        <span>SAVE</span>
                    </button>
                    <div className="container">
                        <p className="w-fit font-bold text-2xl my-4">Your Passwords</p>
                        <table className="table-auto w-full text-left ">
                            <thead className="bg-green-700 rounded-3xl  text-green-100">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-xl"><span className='flex items-center justify-center'>Site</span></th>
                                    <th className=" px-4 py-2"><span className='flex items-center justify-center'>Username</span></th>
                                    <th className=" px-4 py-2"><span className='flex items-center justify-center'>Password</span></th>
                                    <th className=" px-4 py-2 rounded-tr-xl"><span className='flex items-center justify-center'>Action</span></th>
                                </tr>
                            </thead>
                            <tbody className=' bg-green-200'>

                                {TableData.length ? (

                                    TableData.map((row, index) => (

                                        <tr key={row._id || index} className=''>
                                            <td className="border-[2px] border-green-100 px-4 py-2 ">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>{row.site}</span>
                                                    <div className="" onClick={() => copyText(row.site)}>
                                                        <lord-icon
                                                            style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                                            trigger="hover" >
                                                        </lord-icon>
                                                    </div>
                                                </div></td>
                                            <td className="border-[2px] border-green-100 px-4 py-2 ">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>{row.username}</span>
                                                    <div className="" onClick={() => copyText(row.username)}>
                                                        <lord-icon
                                                            style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                                            trigger="hover" >
                                                        </lord-icon>
                                                    </div>
                                                </div></td>
                                            <td className="border-[2px] border-green-100 px-4 py-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>{"*".repeat(String(row.password).length)}</span>
                                                    <div className="" onClick={() => copyText(row.password)}>
                                                        <lord-icon
                                                            style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                            src="https://cdn.lordicon.com/iykgtsbt.json"
                                                            trigger="hover" >
                                                        </lord-icon>
                                                    </div>
                                                </div></td>
                                            <td className="border-[2px] border-green-100 px-4 py-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    <div className="" onClick={() => HandleEdit(row._id)}>
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/gwlusjdu.json"
                                                            trigger="hover"
                                                            style={{ "width": "25px", "height": "25px" }}>
                                                        </lord-icon>
                                                    </div>
                                                    <div className="" onClick={() => HandleDelete(row)}>
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/skkahier.json"
                                                            trigger="hover"
                                                            style={{ "width": "25px", "height": "25px" }}>
                                                        </lord-icon>
                                                    </div>
                                                </div></td>
                                        </tr>

                                    ))) :
                                    (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center py-4 text-gray-500"
                                            >
                                                No data available
                                            </td>
                                        </tr>
                                    )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Main
