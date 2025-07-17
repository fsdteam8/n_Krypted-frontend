


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import Image from "next/image";
import React from "react";
import QuillEditor from "./QuillEditor";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea from shadcn

interface Blog {
  title: string;
  authorName: string;
  description: string;
  image: File | null;
}

interface AddEditBlogsProps {
  handleAddBlog: (e: React.FormEvent) => void;
  newBlog: {
    title: string;
    authorName: string;
    description: string;
    image: File | null;
  };
  setNewBlog: React.Dispatch<React.SetStateAction<Blog>>;
  previewUrl: string;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string>>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  createBlogMutation: {
    isPending: boolean;
  };
  updateBlogMutation: {
    isPending: boolean;
  };
  editingBlog: boolean;
}

function AddEditBlogs({
  handleAddBlog,
  newBlog,
  setNewBlog,
  previewUrl,
  setPreviewUrl,
  handleImageChange,
  createBlogMutation,
  updateBlogMutation,
  editingBlog,
}: AddEditBlogsProps) {
  console.log("editingBlog", newBlog);
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      {" "}
      {/* Add scrollable area */}
      <form onSubmit={handleAddBlog} className="space-y-4 pt-4 pr-4">
        {" "}
        {/* Add right padding */}
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Blog Title</Label>
          <Input
            id="title"
            value={newBlog.title}
            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
            placeholder="Type Blog Title here..."
          />
        </div>
        {/* Author Name */}
        <div className="space-y-2">
          <Label htmlFor="authorName">Author Name</Label>
          <Input
            id="authorName"
            value={newBlog.authorName}
            onChange={(e) => setNewBlog({ ...newBlog, authorName: e.target.value })}
            placeholder="Type Author Name here..."
          />
        </div>
        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <div className="rounded-md border">
            {" "}
            {/* Container for editor with border */}
            <QuillEditor
              id="description"
              value={newBlog.description}
              onChange={(value) => setNewBlog({ ...newBlog, description: value })}
            />
          </div>
        </div>
        {/* Thumbnail */}
        <div className="space-y-2">
          <Label htmlFor="image">Thumbnail</Label>
          <div className="border rounded-md p-4">
            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-40 object-contain"
                  width={200}
                  height={200}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreviewUrl('');
                    setNewBlog((prev: Blog) => ({ ...prev, image: null }));
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <h1>Upload</h1>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Drag and drop image here, or click add image
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("blog-image-upload")?.click()
                  }
                >
                  Add Image
                </Button>
                <input
                  id="blog-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end pb-4">
          {" "}
          {/* Add bottom padding */}
          <Button
            type="submit"
            className="bg-[#212121]"
            disabled={
              createBlogMutation.isPending || updateBlogMutation.isPending
            }
          >
            {createBlogMutation.isPending || updateBlogMutation.isPending
              ? "Saving..."
              : editingBlog
                ? 'Update'
                : 'Save'}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}

export default AddEditBlogs;