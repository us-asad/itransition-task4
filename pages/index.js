import User from 'models/User';
import React, { useState } from 'react';
import { FiLogOut } from "react-icons/fi";
import { TableTR } from 'components';
import { deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { Spinner, SubmitBtn } from 'subcomponents';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FcLock, FcUnlock } from "react-icons/fc";

export default function Home({ users: usersJSON }) {
  const [users, setUsers] = useState(JSON.parse(usersJSON) || []);
  const [checkedUsers, setCheckedUsers] = useState([]);
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const logout = () => {
    deleteCookie("token");
    deleteCookie("email");
    router.push("/auth");
  }

  const checkAllUsers = e => {
    setCheckedUsers(e.target.checked ? users.map(usr => usr.email) : []);
  }

  const onCheckboxChange = (e, email) => {
    if (e.target.checked && !checkedUsers.includes(email)) {
      setCheckedUsers(prev => [...prev, email])
    } else {
      setCheckedUsers(prev => prev.filter(em => em !== email));
    }
  }

  const deleteSelected = async () => {
    if (checkedUsers.includes(getCookie("email"))) {
      const sureToDeleteOwn = confirm("Are you sure to delete also YOURSELF ?")
      if (!sureToDeleteOwn) return;
    }

    setDeleteLoading(true);

    try {
      checkedUsers.forEach(async email => {
        await axios.delete(`${process.env.NEXT_PUBLIC_URL}/api/delete/${email}`, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`
          }
        });
      })
      setUsers(prev => prev.filter(usr => !checkedUsers.includes(usr.email)));
      setCheckedUsers([]);
      if (checkedUsers.includes(getCookie("email"))) {
        deleteCookie("email");
        deleteCookie("token");
        router.push("/auth");
        setDeleteLoading(false)
      }
      toast.success("Successfully deleted!");
    } catch (ex) {
      console.error(ex);
      toast.error(ex?.response?.data?.message || "Server Error!")
    }

    setDeleteLoading(false);
  }

  const changeSelectedStatus = status => {
    if (status) setActivateLoading(true);
    else setDeactivateLoading(true);

    if (checkedUsers.includes(getCookie("email")) && !status) {
      const sureToDeactivateOwn = confirm("Are you sure to deactivate YOURSELF!");
      if (!sureToDeactivateOwn) {
        setActivateLoading(false);
        setDeactivateLoading(false);
        return;
      }
    }

    try {
      checkedUsers.forEach(async email => {
        await axios.put(`${process.env.NEXT_PUBLIC_URL}/api/update/${email}`, { status: status ? "active" : "blocked" }, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`
          }
        });
      })
      setUsers(prev => prev.map(usr => checkedUsers.includes(usr.email) ? {...usr, status: status ? "active" : "block"} : usr));
      if (checkedUsers.includes(getCookie("email")) && !status) {
        deleteCookie("email");
        deleteCookie("token");
        setCheckedUsers([]);
        if (status) setActivateLoading(false);
        else setDeactivateLoading(false);
        router.push("/auth");
      }
      toast.success("Successfully updated!");
    } catch (ex) {
      console.error(ex);
      toast.error(ex?.response?.data?.message || "Server Error!")
    }

    if (status) setActivateLoading(false);
    else setDeactivateLoading(false);
  }

  return (
    <div className='custom-container py-5'>
      <div className="flex justify-center">
        <button onClick={logout} className='flex items-center gap-2 px-4 py-2 text-[18px] font-semibold rounded-lg bg-purple-700 text-white'>
          <span>Log out</span>
          <FiLogOut />
        </button>
      </div>
      <div className={`flex gap-2 ${!checkedUsers.length ? "opacity-50 pointer-events-none" : ""}`}>
        <SubmitBtn
          onClick={deleteSelected}
          text="Delete"
          className="!w-max !px-5 !py-1.5 bg-red-600"
          loading={deleteLoading}
          loadingText="Deleting"
          loadingClassName="!border-red-300 !border-l-red-900 !w-[17px] !h-[17px]"
        />
        <button
          disabled={activateLoading}
          className='px-3 bg-gray-300 py-2 rounded-md text-[20px] w-[44px]'
          onClick={() => changeSelectedStatus(false)}
        >
          {activateLoading ? <Spinner className="!w-[17px] !h-[17px] !border-l-gray-700" /> : <FcLock />}
        </button>
        <button
          disabled={deactivateLoading}
          className='px-3 bg-green-300 py-2 rounded-md text-[20px] w-[44px]'
          onClick={() => changeSelectedStatus(true)}
        >
          {deactivateLoading ? <Spinner className="!w-[17px] !h-[17px] !border-l-green-700" /> : <FcUnlock />}
        </button>
      </div>
      <table className='w-full mt-10 table-auto text-start'>
        <thead className='border-b p-1'>
          <tr>
            <th className={`${thClassName} pl-4`}>
              <input
                onChange={checkAllUsers}
                checked={checkedUsers.length === users.length}
                type="checkbox"
              />
            </th>
            <th className={thClassName}>#</th>
            <th className={thClassName}>Name</th>
            <th className={thClassName}>Email</th>
            <th className={thClassName}>Last login</th>
            <th className={thClassName}>Registration</th>
            <th className={thClassName}>Status</th>
            <th className={thClassName}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user, i) => <TableTR
            key={i}
            i={i}
            user={user}
            checked={checkedUsers.includes(user.email)}
            onCheckboxChange={e => onCheckboxChange(e, user.email)}
            setUsers={setUsers}
            isLoggedUser={getCookie("email") === user.email}
          />)}
        </tbody>
      </table>
    </div>
  )
}

const thClassName = "pb-2 font-medium text-start pr-4"

export async function getServerSideProps() {
  console.log("started");
  const users = await User.find();
  console.log("here we go ", users);

  users?.reverse();
  return {
    props: {
      users: JSON.stringify(users)
    }
  }
}

