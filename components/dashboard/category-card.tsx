"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/lib/api-service";
import Image from "next/image";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface CategoryCardProps {
  category: Category;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

export function CategoryCard({
  category,
  onDelete,
  onUpdate,
}: CategoryCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState({
    name: category.name,
    description: category.description,
    image: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState(category.image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditedCategory({ ...editedCategory, image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editedCategory.name || !editedCategory.description) {
      toast("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", editedCategory.name);
    formData.append("description", editedCategory.description);
    if (editedCategory.image) {
      formData.append("image", editedCategory.image);
    }

    try {
      const response = await apiService.updateCategory(category._id, formData);
      if (response.status === true) {
        toast.success("Category updated successfully");
        setIsEditDialogOpen(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast("Failed to update category");
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          className="w-full h-full object-cover"
          fill
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold capitalize">{category.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {category.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                category.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(category._id)}
                className="bg-red-500 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={editedCategory.name}
                onChange={(e) =>
                  setEditedCategory({ ...editedCategory, name: e.target.value })
                }
                placeholder="Type category name here..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editedCategory.description}
                onChange={(e) =>
                  setEditedCategory({
                    ...editedCategory,
                    description: e.target.value,
                  })
                }
                placeholder="Type category description here..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Thumbnail</Label>
              <div className="border rounded-md p-4">
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-40 object-contain"
                    fill
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("edit-image-upload")?.click()
                    }
                  >
                    Change Image
                  </Button>
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-[#6b614f] hover:bg-[#5c5343]">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
