import User from 'models/User';
import React, { useState } from 'react';
import { FiLogOut } from "react-icons/fi";
import { TableTR } from 'components';
import { deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { SubmitBtn } from 'subcomponents';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Home({ users: usersJSON }) {
  const [users, setUsers] = useState(JSON.parse(usersJSON) || []);
  const [checkedUsers, setCheckedUsers] = useState([]);
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  return (
    <div className='custom-container py-5'>
      <div className="flex justify-center">
        <button onClick={logout} className='flex items-center gap-2 px-4 py-2 text-[18px] font-semibold rounded-lg bg-purple-700 text-white'>
          <span>Log out</span>
          <FiLogOut />
        </button>
      </div>
      <div className="flex items-center">
        <SubmitBtn
          onClick={deleteSelected}
          text="Delete"
          className="!w-max px-5 py-1.5 bg-red-600"
          disabled={!checkedUsers.length}
          loading={deleteLoading}
          loadingText="Deleting"
          loadingClassName="!border-red-300 !border-l-red-900 !w-[17px] !h-[17px]"
        />

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
  const users = await User.find();
  users?.reverse();
  return {
    props: {
      users: JSON.stringify(users)
    }
  }
}

