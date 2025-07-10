"use client";

import type React from "react";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Trash2, Plus, X, Upload, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Layout from "@/components/dashboard/layout";
import { toast } from "sonner";
import { Pagination } from "@/components/dashboard/pagination";

interface Category {
  _id: string;
  categoryName: string;
  image: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  dealCount: number;
}

interface EditCategoryForm {
  categoryName: string;
  image: File | null;
  existingImage?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
  pagination: PaginationInfo;
}

const CategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<EditCategoryForm>({
    categoryName: "",
    image: null,
    existingImage: "",
  });
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories with pagination
  const { data, isLoading, error } = useQuery<CategoryResponse>({
    queryKey: ["categories", page],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories?page=${page}&limit=5`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return await response.json();
      } catch (err) {
        console.error("Error fetching categories:", err);
        throw err;
      }
    },
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Error response:", errorData);
          throw new Error("Failed to add category");
        }

        return response.json();
      } catch (err) {
        console.error("Error adding category:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      resetForm();
      toast.success("Category added successfully", { position: "top-right" });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to add category", { position: "top-right" });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete category");
        }

        return response.json();
      } catch (err) {
        console.error("Error deleting category:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully", { position: "top-right" });
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      toast.error("Failed to delete category", { position: "top-right" });
    },
  });

  // Edit category mutation
  const editCategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
      formData,
    }: {
      categoryId: string;
      formData: FormData;
    }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update category");
        }

        return response.json();
      } catch (err) {
        console.error("Error updating category:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsEditModalOpen(false);
      resetEditForm();
      toast.success("Category updated successfully", { position: "top-right" });
    },
    onError: (error) => {
      console.error("Edit mutation error:", error);
      toast.error("Failed to update category", { position: "top-right" });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCategory({ ...newCategory, image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Reset the input value to allow selecting the same file again if needed
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.categoryName) {
      return;
    }

    const formData = new FormData();
    formData.append("categoryName", newCategory.categoryName);
    if (newCategory.image) {
      formData.append("image", newCategory.image);
    }

    addCategoryMutation.mutate(formData);
  };

  const resetForm = () => {
    setNewCategory({
      categoryName: "",
      image: null,
    });
    setImagePreview(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditCategoryId(category._id);
    setEditCategory({
      categoryName: category.categoryName,
      image: null,
      existingImage: category.image,
    });
    setEditImagePreview(category.image);
    setIsEditModalOpen(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditCategory({ ...editCategory, image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Reset the input value to allow selecting the same file again if needed
      e.target.value = "";
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editCategory.categoryName) {
      return;
    }

    const formData = new FormData();
    formData.append("categoryName", editCategory.categoryName);

    // Only append image if a new one was selected
    if (editCategory.image) {
      formData.append("image", editCategory.image);
    }

    editCategoryMutation.mutate({ categoryId: editCategoryId, formData });
  };

  const resetEditForm = () => {
    setEditCategory({
      categoryName: "",
      image: null,
      existingImage: "",
    });
    setEditImagePreview(null);
    setEditCategoryId("");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Layout>
      <div className=" ">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[25px] lg:text-[40px] text-[#1F2937] font-bold tracking-tight">
              Categories
            </h1>
            <div className="text-base lg:text-xl text-[#595959]">
              Dashboard &gt; Categories
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#212121] hover:bg-[#212121]/90 text-white h-[38px] lg:h-[52px] "
          >
            Add Category <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="min-w-full divide-y divide-gray-200">
            <div className="bg-gray-50">
              <div className="grid grid-cols-12 gap-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-4">
                <div className="col-span-4 text-[#4E4E4E] text-base">
                  Category Name
                </div>
                <div className="col-span-2 text-[#4E4E4E] text-base text-center">
                  Deals
                </div>
                <div className="col-span-3 text-[#4E4E4E] text-base text-center">
                  Added
                </div>
                <div className="col-span-3 text-[#4E4E4E] text-base text-center">
                  Actions
                </div>
              </div>
            </div>
            <div className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <>
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-gray-50"
                      >
                        <div className="col-span-4 flex items-center">
                          <div className="flex-shrink-0 h-[70px] w-[70px] mr-4">
                            <div className="rounded-md w-full h-full bg-gray-200 animate-pulse" />
                          </div>
                          <div className="w-3/4">
                            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-full" />
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-center items-center">
                          <div className="h-5 bg-gray-200 rounded animate-pulse w-8" />
                        </div>
                        <div className="col-span-3 flex justify-center items-center">
                          <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
                        </div>
                        <div className="col-span-3 flex justify-center items-center space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                      </div>
                    ))}
                </>
              ) : error ? (
                <div className="px-6 py-4 text-center text-red-500">
                  Error loading categories
                </div>
              ) : data?.data?.length === 0 ? (
                <div className="px-6 py-4 text-center">No categories found</div>
              ) : (
                data?.data?.map((category) => (
                  <div
                    key={category._id}
                    className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="col-span-4 flex items-center">
                      <div className="flex-shrink-0 h-[70px] w-[70px] mr-4 bg-black/20">
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.categoryName}
                          width={100}
                          height={100}
                          className="rounded-md w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {category.categoryName}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center items-center">
                      <span className="px-2 py-1 text-center">
                        {category.dealCount || 0}
                      </span>
                    </div>
                    <div className="col-span-3 flex justify-center items-center">
                      <span className="text-sm text-gray-500">
                        {formatDate(category.createdAt)}
                      </span>
                    </div>
                    <div className="col-span-3 flex justify-center items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(category._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t">
            {isLoading ? (
              <div className="flex justify-center items-center space-x-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            ) : (
              data?.pagination && (
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  totalItems={data.pagination.totalItems}
                  itemsPerPage={data.pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )
            )}
          </div>
        </div>

        {/* Add Category Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className=" max-w-4xl bg-[#FFFFFF] rounded-lg shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Add Category
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit}
              className=" gap-6"
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block text-sm font-medium mb-1"
                  >
                    Category Name
                  </label>
                  <Input
                    id="categoryName"
                    placeholder="Type category name here..."
                    value={newCategory.categoryName}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        categoryName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photo</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-[250px]"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      setNewCategory({ ...newCategory, image: file });
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Category preview"
                        fill
                        className="object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white rounded-full"
                        onClick={() => {
                          setImagePreview(null);
                          setNewCategory({ ...newCategory, image: null });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Drag and drop image here, or click add image
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Add image
                      </Button>
                      <Input
                        id="image-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white "
                  disabled={addCategoryMutation.isPending}
                >
                  {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl bg-[#FFFFFF] rounded-lg shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Edit Category
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleEditSubmit}
              className=""
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="editCategoryName"
                    className="block text-sm font-medium mb-1"
                  >
                    Category Name
                  </label>
                  <Input
                    id="editCategoryName"
                    placeholder="Type category name here..."
                    value={editCategory.categoryName}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        categoryName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photo</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-[250px]"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      setEditCategory({ ...editCategory, image: file });
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {editImagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={editImagePreview || "/placeholder.svg"}
                        alt="Category preview"
                        fill
                        className="object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white rounded-full"
                        onClick={() => {
                          setEditImagePreview(null);
                          setEditCategory({
                            ...editCategory,
                            image: null,
                            existingImage: "",
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Drag and drop image here, or click add image
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => editFileInputRef.current?.click()}
                      >
                        Add image
                      </Button>
                      <Input
                        id="edit-image-upload"
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditImageChange}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white mt-4"
                  disabled={editCategoryMutation.isPending}
                >
                  {editCategoryMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Delete Category
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteCategoryMutation.isPending}
              >
                {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
