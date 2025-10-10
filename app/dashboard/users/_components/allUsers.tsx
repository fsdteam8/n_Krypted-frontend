"use client";


import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Pagination } from "@/components/dashboard/pagination";
import { Trash } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

interface Meta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface FetchUsersResponse {
  success: boolean;
  meta: Meta;
  data: User[];
}

const fetchUsers = async (token: string, page: number, limit: number): Promise<FetchUsersResponse> => {
  const response = await axios.get<FetchUsersResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/all/user?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

interface DeleteUserParams {
  id: string;
  token: string;
}

interface HandleDeleteClick {
  (id: string): void;
}

const deleteUser = async ({ id, token }: DeleteUserParams): Promise<void> => {
  await axios.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/delete/user?userId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

function AllUsers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Matches the API's itemsPerPage
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", token, currentPage],
    queryFn: () => (token ? fetchUsers(token, currentPage, limit) : Promise.resolve({ success: true, meta: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit }, data: [] })),
    enabled: !!token, // Only fetch when token is available
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      setSelectedUserId(null);
    },
  });

  const handleDeleteClick: HandleDeleteClick = (id) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUserId && token) {
      deleteMutation.mutate({ id: selectedUserId, token });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  if (status === "loading")
    return <div className="text-center py-4">Loading session...</div>;
  if (!token)
    return (
      <div className="text-center py-4 text-red-500">
        Please log in to view users
      </div>
    );
  if (isLoading)
    return <div className="text-center py-4">Loading users...</div>;
  if (error)
    return (
      <div className="text-center py-4 text-red-500">
        Error: {error.message}
      </div>
    );

  const users = usersData?.data || [];
  const meta = usersData?.meta || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: limit };

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Phone Number</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.phoneNumber}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDeleteClick(user._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.totalPages > 10 && (
            <div className="px-6 py-4 border-t">
              <Pagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
                totalItems={meta.totalItems}
                itemsPerPage={meta.itemsPerPage}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-4">Are you sure you want to delete this user?</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default AllUsers;