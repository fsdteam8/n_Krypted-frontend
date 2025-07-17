"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Layout from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAllBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/use-queries";
import Image from "next/image";
import AddEditBlogs from "./_components/addEditBlogs";

import { Pagination } from "@/components/dashboard/pagination";
import DeleteModal from "./_components/detetemodal";

interface Blog {
  _id: string;
  title: string;
  authorName: string;
  description: string;
  image: string;
  createdAt: string;
  commentCount?: number;
}

export default function BlogsPage() {
  const { data: blogsData, isLoading } = useAllBlogs();
  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();
  const deleteBlogMutation = useDeleteBlog();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [formBlog, setFormBlog] = useState({
    title: "",
    authorName: "",
    description: "",
    image: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (blogsData && 'blogs' in blogsData) {
      setBlogs(blogsData.blogs as Blog[]);
      setTotalPages(blogsData.totalPages || 1);
    }
  }, [blogsData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormBlog({ ...formBlog, image: file });

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrEditBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formBlog.title || !formBlog.authorName || !formBlog.description || (!formBlog.image && !editingBlog)) {
      return;
    }

    const formData = new FormData();
    formData.append("title", formBlog.title);
    formData.append("authorName", formBlog.authorName);
    formData.append("description", formBlog.description);
    if (formBlog.image) {
      formData.append("image", formBlog.image);
    }

    if (editingBlog) {
      updateBlogMutation.mutate(
        { id: editingBlog._id, data: formData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingBlog(null);
            setFormBlog({ title: "", authorName: "", description: "", image: null });
            setPreviewUrl("");
          },
        }
      );
    } else {
      createBlogMutation.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setFormBlog({ title: "", authorName: "", description: "", image: null });
          setPreviewUrl("");
        },
      });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    deleteBlogMutation.mutate(id);
  };

  const handleEditClick = (blog: Blog) => {
    setEditingBlog(blog);
    setFormBlog({
      title: blog.title,
      authorName: blog.authorName,
      description: blog.description,
      image: null,
    });
    setPreviewUrl(blog.image);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}, ${date.getFullYear()}`;
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blogs Management</h1>
            <p className="text-muted-foreground">Manage your Blogs</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setEditingBlog(null);
              setFormBlog({ title: "", authorName: "", description: "", image: null });
              setPreviewUrl("");
            }
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#212121]">
                <Plus className="mr-2 h-4 w-4" /> Add Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[50%]">
              <DialogHeader>
                <DialogTitle>{editingBlog ? "Edit Blog" : "Add Blog"}</DialogTitle>
              </DialogHeader>
              <AddEditBlogs
                handleAddBlog={handleAddOrEditBlog}
                newBlog={formBlog}
                setNewBlog={setFormBlog}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                handleImageChange={handleImageChange}
                createBlogMutation={createBlogMutation}
                updateBlogMutation={updateBlogMutation}
                editingBlog={!!editingBlog}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6b614f]"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">Blog Name</th>
                  <th className="text-left p-4">Author</th>
                  <th className="text-left p-4">Added</th>
                  <th className="text-left p-4">Comments</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No blogs found
                    </td>
                  </tr>
                ) : (
                  blogs.map((blog) => (
                    <tr key={blog._id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={blog.image || "/placeholder.svg"}
                            alt={blog.title}
                            className="w-16 h-12 object-cover rounded"
                            width={40}
                            height={40}
                          />
                          <div>
                            <h4 className="font-medium">{blog.title}</h4>
                            <p
                              className="text-sm text-muted-foreground line-clamp-2 max-w-[700px]"
                              dangerouslySetInnerHTML={{ __html: blog.description }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{blog.authorName}</td>
                      <td className="p-4">{formatDate(blog.createdAt)}</td>
                      <td className="p-4">{blog.commentCount}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleEditClick(blog)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <DeleteModal
                              blogId={blog._id}
                              handleDeleteBlog={handleDeleteBlog}
                            />
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages >= 1 && (
          <div className="px-6 py-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              totalItems={blogs.length}
              itemsPerPage={('itemsPerPage' in (blogsData ?? {}) ? (blogsData as { itemsPerPage?: number }).itemsPerPage ?? 10 : 10)}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}