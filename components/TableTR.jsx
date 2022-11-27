import axios from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { BsFillTrashFill } from 'react-icons/bs'
import { FaPen } from 'react-icons/fa'
import { toast } from 'react-toastify';
import { FormField, Spinner } from 'subcomponents';
import { getRegisterConfig } from 'utils/functions';

export default function TableTR({ user, i, checked, onCheckboxChange, setUsers, isLoggedUser: loggedUsr }) {
  const [edit, setEdit] = useState(false);
  const [isLoggedUser, setIsLoggedUser] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: user.name,
      status: user.status
    }
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  const save = async (data) => {
    setEdit(false);
    setLoading(true);
    if (edit) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_URL}/api/update/${user.email}`, data, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`
          }
        });
        if (isLoggedUser) {
          deleteCookie("token");
          deleteCookie("email")
          router.push("/auth");
        }
      } catch (ex) {
        console.error(ex);
        toast.error(ex?.response?.data?.message || "Server Error!")
      }
    }
    setLoading(false);
  }

  const remove = async () => {
    const sureToDelete = confirm(`Are you sure to delete ? ${isLoggedUser ? "You are deleting YOURSELF" : ""}`)
    if (sureToDelete) {
      setDeleteLoading(true)
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_URL}/api/delete/${user.email}`, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`
          }
        });
        setUsers(prev => prev.filter(usr => usr.email !== user.email));

        if (isLoggedUser) {
          deleteCookie("email")
          deleteCookie("token")
          router.push("/auth");
          setDeleteLoading(false);
        }

        toast.success("Successfully deleted!");
      } catch (ex) {
        console.error(ex);
        toast.error(ex?.response?.data?.message || "Server Error!")
      }

      setDeleteLoading(false)
    }
  }

  useEffect(() => {
    setIsLoggedUser(loggedUsr)
  }, []);

  return (
    <tr className="relative border-b cursor-pointer min-h-[50px] h-[50px] hover:bg-slate-200 duration-200">
      <td className={`${tdClassName} pl-4`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheckboxChange}
        />
      </td>
      <td className={tdClassName}>{i + 1}</td>
      <td className={tdClassName}>
        {edit ? (
          <FormField
            type="text"
            defaultValue={user.name}
            inputClassName="!px-2 !py-0.5 !text-[16px] w-[200px]"
            registers={register("name", getRegisterConfig(true, 3, 100))}
            error={errors.name?.message}
          />
        ) : watch("name")}
      </td>
      <td className={tdClassName}>{user.email}</td>
      <td className={tdClassName}>{new Date(user.last_login).toLocaleString()}</td>
      <td className={tdClassName}>{new Date(user.createdAt).toLocaleString()}</td>
      <td className={tdClassName}>
        {edit ? (
          <label className='flex flex-col'>
            <select
              className={`px-2 py-0.5 border-2 rounded-md ${errors.status?.message ? "border-red-600" : "border-purple-700"}`}
              {...register("status", getRegisterConfig(true, false, false))}
            >
              {["active", "blocked"].map(status => (
                <option value={status} key={status}>{status}</option>
              ))}
            </select>
            {errors.status?.message ? <span className='text-[14px] text-red-600'>{errors.status?.message}</span> : null}
          </label>
        ) : watch("status")}
      </td>
      <td className={`flex gap-4 items-center h-[50px] text-[16px] ${tdClassName}`}>
        <div className="text-green-600 hover:opacity-70 duration-100">
          {edit ? (
            <button onClick={handleSubmit(save)} disabled={loading}>{
              !loading ? "Save" : <Spinner className={`!border-green-300 !border-l-green-600 ${loading ? "opacity-70" : ""}`} />
            }</button>
          ) : (
            <button onClick={() => setEdit(true)}>
              <FaPen />
            </button>
          )}
        </div>
        <button onClick={remove} className='text-red-600 hover:opacity-70 duration-100 relative z-[2]'>
          {!deleteLoading ? <BsFillTrashFill /> : <Spinner className={`!border-red-300 !border-l-red-600 ${loading ? "opacity-70" : ""}`} />}
        </button>
      </td>
      <td style={!isLoggedUser ? { display: "none" } : {}} className={`absolute top-1 right-0 text-[14px] bg-purple-700 px-2.5 flex items-center pb-[2px] rounded-lg text-white z-[1]`}>you</td>
    </tr>
  )
}

const tdClassName = `pr-4`;
