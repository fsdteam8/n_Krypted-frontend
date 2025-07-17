"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import QuillEditor from "../../blogs/_components/QuillEditor";
import { useSession } from "next-auth/react";

interface Location {
  country: string;
  city: string;
}

interface ScheduleDate {
  day: Date;
  active: boolean;
  participationsLimit: number;
  time: null;
  bookedCount: number;
  _id?: string;
}

interface DealData {
  title: string;
  description: string;
  price: number;
  location: Location;
  offers: string[];
  images: string[];
  participationsLimit: number;
  time: string;
  status?: string;
  category?: string;
  scheduleDates: {
    date: string;
    active: boolean;
    participationsLimit: number;
    time: null;
    bookedCount: number;
    _id?: string;
  }[];
}

interface Category {
  _id: string;
  categoryName: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface EditDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
}

export default function EditDealModal({
  open,
  onOpenChange,
  dealId,
}: EditDealModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [offerInput, setOfferInput] = useState("");
  const [offers, setOffers] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("none");
  const [scheduleDates, setScheduleDates] = useState<ScheduleDate[]>([]);
  const [timer, setTimer] = useState("off");
  const [status, setStatus] = useState("activate");

  // New state for tracking removals
  const [scheduleDatesToRemove, setScheduleDatesToRemove] = useState<string[]>(
    []
  );
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  console.log(status);
  const session = useSession();
  const token = session?.data?.user.accessToken;
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json();
      } catch (err) {
        console.error("Error fetching categories:", err);
        throw err;
      }
    },
  });

  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DealData>();

  const convertMinutesToDecimalHours = (minutes: number): string => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}.${mins.toString().padStart(2, "0")}`;
  };

  const convertDecimalHoursToMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(".").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValidDate = (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  useEffect(() => {
    if (open && dealId) {
      const fetchDealData = async (id: string) => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/deals/${id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch deal data");
          }
          const data = await response.json();
          setValue("title", data.deal.title || "");
          setValue("description", data.deal.description || "");
          setDescription(data.deal.description || "");
          setValue("price", data.deal.price || 0);
          setValue("location.country", data.deal.location?.country || "");
          setValue("location.city", data.deal.location?.city || "");
          setValue("participationsLimit", data.deal.participationsLimit || 0);
          setValue("time", convertMinutesToDecimalHours(data.deal.time || 0));
          setCategory(data.deal.category?._id || "none");
          setOffers(data.deal.offers || []);
          setExistingImages(data.deal.images || []);
          setTimer(data.deal.timer || "off");
          setStatus(data.deal.status || "activate");
          setScheduleDates(
            data.deal.scheduleDates
              ? data.deal.scheduleDates
                  .map(
                    (dateObj: {
                      date: string;
                      active: boolean;
                      participationsLimit: number;
                      time: null;
                      bookedCount: number;
                      _id?: string;
                    }) => {
                      const date = new Date(dateObj.date);
                      return isValidDate(date)
                        ? {
                            day: date,
                            active: dateObj.active,
                            participationsLimit:
                              dateObj.participationsLimit || 0,
                            time: dateObj.time,
                            bookedCount: dateObj.bookedCount || 0,
                            _id: dateObj._id,
                          }
                        : null;
                    }
                  )
                  .filter(
                    (date: ScheduleDate | null): date is ScheduleDate =>
                      date !== null
                  )
              : []
          );
        } catch (error) {
          console.error("Error fetching deal data:", error);
          toast.error("Failed to load deal data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDealData(dealId);
    }
  }, [open, dealId, setValue]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) =>
        URL.revokeObjectURL(URL.createObjectURL(file))
      );
    };
  }, [selectedFiles]);

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deals/${dealId}`,
        {
          method: "PATCH",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update deal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal updated successfully", { position: "top-right" });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating deal:", error);
      toast.error("Failed to update deal. Please check your input data.", {
        position: "top-right",
      });
    },
  });

  const resetForm = () => {
    setValue("title", "");
    setValue("description", "");
    setDescription("");
    setValue("price", 0);
    setValue("location.country", "");
    setValue("location.city", "");
    setValue("participationsLimit", 0);
    setValue("time", "");
    setCategory("none");
    setOffers([]);
    setExistingImages([]);
    setSelectedFiles([]);
    setScheduleDates([]);
    setTimer("off");
    setStatus("activate");
    // Reset removal tracking arrays
    setScheduleDatesToRemove([]);
    setImagesToRemove([]);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const onSubmit = async (data: DealData) => {
    if (!dealId) return;
    if (scheduleDates.length === 0) {
      toast.error("Please select at least one schedule date", {
        position: "top-right",
      });
      return;
    }
    if (scheduleDates.some((date) => date.participationsLimit <= 0)) {
      toast.error(
        "Please set a valid participation limit for all schedule dates",
        {
          position: "top-right",
        }
      );
      return;
    }

    const invalidDates = scheduleDates.filter(
      (dateObj) => !isValidDate(dateObj.day)
    );
    if (invalidDates.length > 0) {
      console.error("Invalid dates found in scheduleDates:", invalidDates);
      toast.error("One or more schedule dates are invalid", {
        position: "top-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("location[country]", data.location.country);
    formData.append("location[city]", data.location.city);
    formData.append("time", String(convertDecimalHoursToMinutes(data.time)));
    formData.append("timer", timer);
    formData.append("category", category === "none" ? "" : category);

    offers.forEach((offer, index) => {
      formData.append(`offers[${index}]`, offer);
    });

    existingImages.forEach((image, index) => {
      formData.append(`existingImages[${index}]`, image);
    });

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    formData.append(
      "scheduleDates",
      JSON.stringify(
        scheduleDates.map((dateObj) => ({
          date: dateObj.day.toISOString(),
          active: dateObj.active,
          participationsLimit: dateObj.participationsLimit,
          time: dateObj.time,
          bookedCount: dateObj.bookedCount,
          _id: dateObj._id,
        }))
      )
    );

    // Add the new fields for removals
    if (scheduleDatesToRemove.length > 0) {
      formData.append(
        "scheduleDatesToRemove",
        JSON.stringify(scheduleDatesToRemove)
      );
    }

    if (imagesToRemove.length > 0) {
      formData.append("imagesToRemove", JSON.stringify(imagesToRemove));
    }

    updateMutation.mutate(formData);
  };

  const handleAddOffer = () => {
    if (offerInput.trim()) {
      setOffers([...offers, offerInput.trim()]);
      setOfferInput("");
    }
  };

  const handleRemoveOffer = (index: number) => {
    setOffers(offers.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const maxImages = 5;
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ["image/jpeg", "image/png"];
      const totalImages =
        existingImages.length + selectedFiles.length + e.target.files.length;
      if (totalImages > maxImages) {
        toast.error(`You can only upload up to ${maxImages} images`, {
          position: "top-right",
        });
        return;
      }

      const validFiles = Array.from(e.target.files).filter((file) => {
        if (file.size > maxSizeInBytes) {
          toast.error(`Image "${file.name}" exceeds 10MB limit`, {
            position: "top-right",
          });
          return false;
        }
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Image "${file.name}" must be JPEG or PNG`, {
            position: "top-right",
          });
          return false;
        }
        return true;
      });
      setSelectedFiles([...selectedFiles, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const file = selectedFiles[index];
    URL.revokeObjectURL(URL.createObjectURL(file));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    const imageToRemove = existingImages[index];
    // Add to removal tracking array
    setImagesToRemove((prev) => [...prev, imageToRemove]);
    // Remove from existing images array
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleRemoveScheduleDate = (index: number) => {
    const scheduleToRemove = scheduleDates[index];
    // Only track for removal if it has an _id (exists in database)
    if (scheduleToRemove._id) {
      setScheduleDatesToRemove((prev) => [...prev, scheduleToRemove._id!]);
    }
    // Remove from schedule dates array
    setScheduleDates((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading deal data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                className="w-full"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <div className="border rounded-md">
                <QuillEditor
                  id="description"
                  value={description}
                  onChange={(content) => {
                    setValue("description", content);
                    setDescription(content);
                  }}
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Deal Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Price must be positive" },
                })}
                className="w-full"
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register("location.country", {
                    required: "Country is required",
                  })}
                  className="w-full"
                />
                {errors.location?.country && (
                  <p className="text-red-500 text-sm">
                    {errors.location.country.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("location.city", {
                    required: "City is required",
                  })}
                  className="w-full"
                />
                {errors.location?.city && (
                  <p className="text-red-500 text-sm">
                    {errors.location.city.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Deal Time (hours.minutes)</Label>
              <Input
                id="time"
                type="text"
                {...register("time", {
                  required: "Deal time is required",
                  pattern: {
                    value: /^\d*\.?\d*$/,
                    message: "Enter time in hours.minutes format (e.g., 2.30)",
                  },
                })}
                className="w-full"
                placeholder="e.g., 2.30 (2 hours 30 minutes)"
              />
              {errors.time && (
                <p className="text-red-500 text-sm">{errors.time.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer">Timer</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="timer"
                  checked={timer === "on"}
                  onCheckedChange={() =>
                    setTimer(timer === "on" ? "off" : "on")
                  }
                  aria-label="Toggle timer"
                />
                <span>{timer === "on" ? "On" : "Off"}</span>
              </div>
            </div>
            {/* Schedule Dates - Enhanced Section */}
            <div className="grid gap-2">
              <Label htmlFor="scheduleDates">Schedule Dates</Label>
              <style jsx global>{`
                .react-datepicker__day--selected,
                .react-datepicker__day--keyboard-selected,
                .react-datepicker__day--highlighted {
                  background-color: #ff0000 !important;
                  color: white !important;
                  border-radius: 50% !important;
                }
              `}</style>
              <div className="flex gap-2 mb-2">
                <DatePicker
                  id="scheduleDates"
                  selected={null}
                  onChange={(date: Date | null) => {
                    if (date && isValidDate(date) && date >= new Date()) {
                      const isDuplicate = scheduleDates.some(
                        (existingDate) =>
                          existingDate.day.toDateString() ===
                          date.toDateString()
                      );
                      if (!isDuplicate) {
                        setScheduleDates((prev) => [
                          ...prev,
                          {
                            day: date,
                            active: true,
                            participationsLimit: 10,
                            time: null,
                            bookedCount: 0,
                          },
                        ]);
                      } else {
                        toast.error("This date is already selected", {
                          position: "top-right",
                        });
                      }
                    } else {
                      toast.error("Cannot select past dates", {
                        position: "top-right",
                      });
                    }
                  }}
                  placeholderText="Select dates..."
                  minDate={new Date()}
                  className="w-full border rounded p-2 bg-[#f5f1eb]"
                  highlightDates={scheduleDates.map((d) => d.day)}
                  dayClassName={(date) =>
                    scheduleDates.some(
                      (d) => d.day.toDateString() === date.toDateString()
                    )
                      ? "react-datepicker__day--highlighted"
                      : ""
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Track all existing schedule dates for removal
                    const existingIds = scheduleDates
                      .filter((date) => date._id)
                      .map((date) => date._id!);
                    setScheduleDatesToRemove((prev) => [
                      ...prev,
                      ...existingIds,
                    ]);
                    setScheduleDates([]);
                  }}
                  disabled={scheduleDates.length === 0}
                  aria-label="Clear all schedule dates"
                >
                  Clear All
                </Button>
              </div>
              <div className="mt-2 max-h-60 overflow-y-auto">
                {scheduleDates.length === 0 && (
                  <p className="text-sm text-gray-500">No dates selected</p>
                )}
                {scheduleDates.length > 0 && (
                  <div className="space-y-2">
                    {scheduleDates
                      .sort((a, b) => a.day.getTime() - b.day.getTime())
                      .map((dateObj, index) => (
                        <div
                          key={dateObj._id || index}
                          className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border ${
                            dateObj.active
                              ? "bg-muted/50"
                              : "bg-gray-100 opacity-75"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Switch
                              checked={dateObj.active}
                              onCheckedChange={(checked) =>
                                setScheduleDates((prev) =>
                                  prev.map((d, i) =>
                                    i === index ? { ...d, active: checked } : d
                                  )
                                )
                              }
                              aria-label={`Toggle active status for ${dateObj.day.toLocaleDateString(
                                "en-US"
                              )}`}
                            />
                            <span className="font-medium">
                              {isValidDate(dateObj.day)
                                ? dateObj.day.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Invalid Date (Contact support)"}
                            </span>
                            {dateObj.bookedCount > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {dateObj.bookedCount} booked
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex items-center gap-1">
                              <Label
                                htmlFor={`limit-${dateObj._id || index}`}
                                className="whitespace-nowrap"
                              >
                                Limit:
                              </Label>
                              <Input
                                id={`limit-${dateObj._id || index}`}
                                type="number"
                                value={dateObj.participationsLimit}
                                onChange={(e) =>
                                  setScheduleDates((prev) =>
                                    prev.map((d, i) =>
                                      i === index
                                        ? {
                                            ...d,
                                            participationsLimit: Math.max(
                                              0,
                                              Number(e.target.value)
                                            ),
                                          }
                                        : d
                                    )
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "-" || e.key === "e") {
                                    e.preventDefault();
                                  }
                                }}
                                className="w-20 h-8 text-center"
                                min="0"
                                aria-label={`Set participation limit for ${dateObj.day.toLocaleDateString(
                                  "en-US"
                                )}`}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleRemoveScheduleDate(index)}
                              aria-label={`Remove date ${dateObj.day.toLocaleDateString(
                                "en-US"
                              )}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Offers</Label>
              <div className="flex gap-2">
                <Input
                  value={offerInput}
                  onChange={(e) => setOfferInput(e.target.value)}
                  placeholder="Add an offer"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddOffer}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {offers.map((offer, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-muted px-3 py-1 rounded-full"
                  >
                    <span>{offer}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => handleRemoveOffer(index)}
                      aria-label={`Remove offer ${offer}`}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Images</Label>
              <div className="border-2 border-dashed border-muted rounded-md p-4">
                <div className="flex items-center justify-center flex-col">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop or click to upload
                  </p>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    Select Files
                  </Button>
                </div>
              </div>
              {existingImages.length > 0 && (
                <div>
                  <Label className="mb-2 block">Existing Images</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image || "/placeholder.svg"}
                          width={100}
                          height={100}
                          alt={`Existing image ${index}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveExistingImage(index)}
                          aria-label={`Remove existing image ${index}`}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedFiles.length > 0 && (
                <div>
                  <Label className="mb-2 block">New Images</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          width={100}
                          height={100}
                          alt={`New image ${index}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveFile(index)}
                          aria-label={`Remove new image ${index}`}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
