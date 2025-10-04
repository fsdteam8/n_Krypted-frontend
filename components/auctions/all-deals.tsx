"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterIcon, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { DealsCard } from "../DealsCard";
import { Pagination } from "../dashboard/pagination";
import { debounce } from "lodash";

// Type definitions
interface Location {
  country: string;
  city: string;
}

interface Category {
  _id: string;
  categoryName: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  location: Location;
}

interface ScheduleDate {
  date: string;
  active: boolean;
  participationsLimit: number;
  bookedCount: number;
  _id: string;
}

interface Deal {
  time: number | undefined;
  bookingCount: number;
  participationsLimit: number | undefined;
  _id: string;
  title: string;
  shortDescription?: string;
  description: string;
  participations: number;
  price: number;
  location: Location;
  images: string[];
  offers: string[];
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  timer?: string;
  scheduleDates?: ScheduleDate[];
}

interface UniqueLocation {
  country: string;
  cities: string[];
}

// Helper functions for location normalization
const normalizeKey = (s?: string | null) =>
  (s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

const prettyLabel = (s?: string | null) => {
  const base = (s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
  return base.replace(/\p{L}[\p{L}\p{M}'-]*/gu, (word) =>
    word
      .split("-")
      .map((part) =>
        part
          ? part.charAt(0).toLocaleUpperCase() +
            part.slice(1).toLocaleLowerCase()
          : part
      )
      .join("-")
  );
};

const eqNorm = (a?: string | null, b?: string | null) =>
  normalizeKey(a) === normalizeKey(b);

// Custom hook for managing URL parameters with debouncing
function useURLParams() {
  const router = useRouter();
  const searchParams: ReturnType<typeof useSearchParams> = useSearchParams();

  const debouncedUpdate = useMemo(
    () =>
      debounce((params: URLSearchParams) => {
        const queryString = params.toString();
        router.push(`?${params?.toString() || queryString}`, { scroll: false });
      }, 300),
    [router]
  );

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value.toString());
        }
      });

      if (!updates.page && Object.keys(updates).length > 0) {
        params.set("page", "1");
      }

      debouncedUpdate(params);
    },
    [searchParams, debouncedUpdate]
  );

  return { searchParams, updateParams };
}

// Optimized Manual Slider Component
const ManualSlider = React.memo(
  (props: {
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    min?: number;
    max?: number;
    onDragStart?: () => void;
    onDragEnd?: () => void;
  }) => {
    const {
      value,
      onValueChange,
      min = 0,
      max = 100,
      onDragStart,
      onDragEnd,
    } = props;
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const getPositionFromValue = (val: number) => {
      const percentage = (val - min) / (max - min);
      return percentage * 100;
    };

    const getValueFromPosition = useCallback(
      (pos: number, rect: DOMRect) => {
        const percentage = (pos - rect.left) / rect.width;
        const newValue = min + percentage * (max - min);
        return Math.max(min, Math.min(max, newValue));
      },
      [min, max]
    );

    const handleMouseDown = (e: React.MouseEvent, thumb: "min" | "max") => {
      e.preventDefault();
      setIsDragging(thumb);
      onDragStart?.();
      if (sliderRef.current) {
        sliderRef.current.focus();
      }
    };

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const newValue = getValueFromPosition(e.clientX, rect);

        let newMin = localValue[0];
        let newMax = localValue[1];

        if (isDragging === "min") {
          newMin = Math.min(newValue, localValue[1] - 1);
        } else if (isDragging === "max") {
          newMax = Math.max(newValue, localValue[0] + 1);
        }

        const newRange: [number, number] = [newMin, newMax];
        setLocalValue(newRange);
        onValueChange(newRange);
      },
      [isDragging, localValue, onValueChange, getValueFromPosition]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(null);
      onDragEnd?.();
    }, [onDragEnd]);

    const handleTouchStart = (e: React.TouchEvent, thumb: "min" | "max") => {
      e.preventDefault();
      setIsDragging(thumb);
      onDragStart?.();
      if (sliderRef.current) {
        sliderRef.current.focus();
      }
    };

    const handleTouchMove = useCallback(
      (e: TouchEvent) => {
        if (!isDragging || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const newValue = getValueFromPosition(e.touches[0].clientX, rect);

        let newMin = localValue[0];
        let newMax = localValue[1];

        if (isDragging === "min") {
          newMin = Math.min(newValue, localValue[1] - 1);
        } else if (isDragging === "max") {
          newMax = Math.max(newValue, localValue[0] + 1);
        }

        const newRange: [number, number] = [newMin, newMax];
        setLocalValue(newRange);
        onValueChange(newRange);
      },
      [isDragging, localValue, onValueChange, getValueFromPosition]
    );

    const handleTouchEnd = useCallback(() => {
      setIsDragging(null);
      onDragEnd?.();
    }, [onDragEnd]);

    useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchmove", handleTouchMove);
        window.addEventListener("touchend", handleTouchEnd);
        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
          window.removeEventListener("touchmove", handleTouchMove);
          window.removeEventListener("touchend", handleTouchEnd);
        };
      }
    }, [
      isDragging,
      handleMouseMove,
      handleMouseUp,
      handleTouchMove,
      handleTouchEnd,
    ]);

    const minPosition = getPositionFromValue(localValue[0]);
    const maxPosition = getPositionFromValue(localValue[1]);

    return (
      <div
        className="relative w-full h-2 bg-gray-200 rounded-full mt-4 sm:mt-6"
        ref={sliderRef}
        tabIndex={0}
      >
        <div
          className="absolute h-full bg-[#4E4E4E] rounded-full transition-all duration-100 will-change-[left,width]"
          style={{
            left: `${minPosition}%`,
            width: `${maxPosition - minPosition}%`,
          }}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-[#4E4E4E] rounded-full -top-1 cursor-pointer focus:outline-none slider-thumb"
          style={{ left: `${minPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={(e) => handleMouseDown(e, "min")}
          onTouchStart={(e) => handleTouchStart(e, "min")}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-[#4E4E4E] rounded-full -top-1 cursor-pointer focus:outline-none slider-thumb"
          tabIndex={0}
          style={{ left: `${maxPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={(e) => handleMouseDown(e, "max")}
          onTouchStart={(e) => handleTouchStart(e, "max")}
        />
      </div>
    );
  }
);

ManualSlider.displayName = "ManualSlider";

// Debounced Slider Wrapper
const DebouncedSlider = ({
  value,
  onChange,
  min,
  max,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}) => {
  const debouncedOnChange = useMemo(() => debounce(onChange, 300), [onChange]);

  const isDraggingRef = useRef(false);

  const handleChange = (newValue: [number, number]) => {
    if (isDraggingRef.current) {
      onChange(newValue);
    } else {
      debouncedOnChange(newValue);
    }
  };

  return (
    <ManualSlider
      value={value}
      onValueChange={handleChange}
      min={min}
      max={max}
      onDragStart={() => {
        isDraggingRef.current = true;
        debouncedOnChange.cancel();
      }}
      onDragEnd={() => {
        isDraggingRef.current = false;
        debouncedOnChange.flush();
      }}
    />
  );
};

DebouncedSlider.displayName = "DebouncedSlider";

function DealsPage() {
  const { searchParams, updateParams } = useURLParams();
  const axiosInstance = useAxios();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [uniqueLocations, setUniqueLocations] = useState<UniqueLocation[]>([]);

  // Get current values from URL
  const currentCategory = searchParams.get("categoryName") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentCity = searchParams.get("city") || "";
  const currentMinPrice = searchParams.get("minPrice") || "0";
  const currentMaxPrice = searchParams.get("maxPrice") || "100";
  const currentDealType = searchParams.get("dealType") || "";
  const currentPage = Number.parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  // Local state for filters
  const [selectedCategory, setSelectedCategory] =
    useState<string>(currentCategory);
  const [selectedCountry, setSelectedCountry] =
    useState<string>(currentCountry);
  const [selectedCity, setSelectedCity] = useState<string>(currentCity);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.parseInt(currentMinPrice) || 0,
    Number.parseInt(currentMaxPrice) || 100,
  ]);
  const [selectedDealType, setSelectedDealType] =
    useState<string>(currentDealType);

  // Sync local state with URL params
  useEffect(() => {
    setSelectedCategory(currentCategory);
    setSelectedCountry(currentCountry);
    setSelectedCity(currentCity);
    setPriceRange([
      Number.parseInt(currentMinPrice) || 0,
      Number.parseInt(currentMaxPrice) || 100,
    ]);
    setSelectedDealType(currentDealType);
  }, [
    currentCategory,
    currentCountry,
    currentCity,
    currentMinPrice,
    currentMaxPrice,
    currentDealType,
  ]);

  // Fetch all deals to get unique locations using useQuery (like in categories)
  const { data: allDealsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["deals-all-locations"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/api/deals", {
          params: {
            page: 1,
            limit: 100000,
            showAll: true,
          },
        });
        console.log("All Deals Data for Locations:", data);
        return data.deals || [];
      } catch (error) {
        console.error("Error fetching all deals for locations:", error);
        return [];
      }
    },
  });

  // Fetch deals with filters
  const {
    data: response,
    isLoading: isLoadingDeals,
    error: dealsError,
  } = useQuery({
    queryKey: [
      "deals",
      currentCategory,
      currentCountry,
      currentCity,
      currentMinPrice,
      currentMaxPrice,
      currentDealType,
      currentPage,
      search,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentCategory) params.set("categoryName", currentCategory);
      if (currentCountry) params.set("country", currentCountry);
      if (currentCity) params.set("city", currentCity);
      params.set("minPrice", currentMinPrice);
      params.set("maxPrice", currentMaxPrice);
      if (currentDealType) params.set("dealType", currentDealType);
      params.set("page", currentPage.toString());
      params.set("limit", "10");
      if (search.trim()) params.set("title", search.trim());

      console.log("API Request Params:", params.toString());

      try {
        const { data } = await axiosInstance.get(
          `/api/deals?showAll=true&${params.toString()}`
        );
        console.log("API Response:", data);
        return data;
      } catch (error) {
        console.error("Error fetching deals:", error);
        throw error;
      }
    },
  });

  // Memoize deals data
  const filteredDealsData = useMemo(
    () => response?.deals || [],
    [response?.deals]
  );
  const totalPages: number = response?.pagination?.totalPages || 5;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        setCategoryError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Extract unique locations from all deals data (like in the search bar implementation)
  useEffect(() => {
    if (allDealsData && allDealsData.length > 0) {
      const locationMap = new Map<
        string,
        { label: string; cities: Map<string, string> }
      >();

      allDealsData.forEach((deal: Deal) => {
        const country = deal.location?.country;
        const city = deal.location?.city;
        
        if (country && city) {
          const countryKey = normalizeKey(country);
          const cityKey = normalizeKey(city);
          
          if (!countryKey || !cityKey) return;

          if (!locationMap.has(countryKey)) {
            locationMap.set(countryKey, {
              label: prettyLabel(country),
              cities: new Map(),
            });
          }
          
          const entry = locationMap.get(countryKey)!;
          if (!entry.cities.has(cityKey)) {
            entry.cities.set(cityKey, prettyLabel(city));
          }
        }
      });

      // Convert to array and sort
      const uniqueLocs: UniqueLocation[] = Array.from(locationMap.values())
        .map((v) => ({
          country: v.label,
          cities: Array.from(v.cities.values()).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" })
          ),
        }))
        .sort((a, b) =>
          a.country.localeCompare(b.country, undefined, { sensitivity: "base" })
        );

      console.log("Processed unique locations:", uniqueLocs);
      setUniqueLocations(uniqueLocs);
    } else {
      console.log("No deals data available for locations");
      setUniqueLocations([]);
    }
  }, [allDealsData]);

  // Handle filter changes
  const handleCategoryChange = (
    categoryName: string,
    checked: boolean | "indeterminate"
  ) => {
    const isChecked = checked === true;
    const newCategory = isChecked
      ? categoryName
      : selectedCategory === categoryName
      ? ""
      : categoryName;
    setSelectedCategory(newCategory);
    updateParams({ categoryName: newCategory });
    setIsFilterOpen(false);
  };

  const handleCountrySelect = (country: string) => {
    const newCountry = eqNorm(country, selectedCountry)
      ? ""
      : prettyLabel(country);
    setSelectedCountry(newCountry);
    setSelectedCity("");
    updateParams({
      country: newCountry || null,
      city: null,
    });
    setIsFilterOpen(false);
  };

  const handleCitySelect = (city: string, country: string) => {
    const newCity = eqNorm(city, selectedCity) ? "" : prettyLabel(city);
    const canonCountry = prettyLabel(country);
    setSelectedCity(newCity);
    setSelectedCountry(canonCountry);
    updateParams({
      city: newCity || null,
      country: canonCountry || null,
    });
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
  };

  // Get display text for location dropdown
  const getLocationDisplayText = () => {
    if (selectedCity && selectedCountry) {
      return `${selectedCity}, ${selectedCountry}`;
    }
    if (selectedCountry) {
      return selectedCountry;
    }
    return "Alle Städte";
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedCountry || selectedCity) count++;
    if (selectedDealType) count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 100) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Debounced version of updateParams for price inputs
  const debouncedUpdateParams = useMemo(
    () => debounce(updateParams, 300),
    [updateParams]
  );

  const resetAllFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedCity("");
    setPriceRange([0, 100]);
    setSelectedDealType("");

    updateParams({
      categoryName: null,
      country: null,
      city: null,
      minPrice: "0",
      maxPrice: "100",
      dealType: null,
      page: "1",
    });
  }, [updateParams]);

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <div className="space-y-6 bg-white p-4 sm:p-5 rounded-lg shadow-sm w-full max-w-full lg:max-w-[300px]">
      {/* Categories */}
      <div>
        <h3 className="text-lg sm:text-xl lg:text-[20px] font-semibold text-[#212121] mb-3 sm:mb-4">
          Kategorien
        </h3>
        {isLoadingCategories ? (
          <div className="py-2 text-sm sm:text-base">
            Kategorien werden geladen...
          </div>
        ) : categoryError ? (
          <div className="text-red-500 py-2 text-sm sm:text-base">
            Error: {categoryError}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-2 text-sm sm:text-base text-gray-500">
            Keine Kategorien verfügbar
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {categories.map((category) => (
              <div key={category._id} className="flex items-center space-x-3">
                <Checkbox
                  id={`category-${category.categoryName}`}
                  checked={selectedCategory === category.categoryName}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.categoryName, checked)
                  }
                />
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`category-${category.categoryName}`}
                    className="text-sm sm:text-base lg:text-lg cursor-pointer text-[#4E4E4E] font-medium"
                  >
                    {category.categoryName}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locations */}
      <div className="overflow-hidden">
        <h3 className="text-lg sm:text-xl lg:text-[20px] font-semibold text-[#212121] mb-3 sm:mb-4">
          Städte
        </h3>
        {isLoadingLocations ? (
          <div className="py-2 text-sm sm:text-base">
            Standorte werden geladen...
          </div>
        ) : uniqueLocations.length === 0 ? (
          <div className="py-2 text-sm sm:text-base text-gray-500">
            Keine Standorte verfügbar
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white py-[25px] lg:h-[52px] text-black !rounded-l-none hover:bg-gray-100 border-0 gap-2 w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm sm:text-base lg:text-lg cursor-pointer text-[#4E4E4E] font-medium">
                    {getLocationDisplayText()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="p-0 max-w-[200px] z-50 overflow-visible"
            >
              <div
                onClick={() => {
                  handleCountrySelect("");
                  handleCitySelect("", "");
                }}
                className={`px-4 py-2 cursor-pointer  ${
                  !selectedCountry && !selectedCity ? "bg-gray-100" : ""
                }`}
              >
                Alle Städte
              </div>
              {uniqueLocations.map(({ country, cities }) => {
                const isActiveCountry =
                  eqNorm(selectedCountry, country) && !selectedCity;
                return (
                  <div key={country} className="relative group w-full">
                    <div
                      onClick={() => handleCountrySelect(country)}
                      className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        isActiveCountry ? "bg-gray-100" : ""
                      }`}
                    >
                      <span>{country}</span>
                      <ChevronDown className="h-4 w-4 transform group-hover:rotate-180 transition-transform" />
                    </div>
                    <div className="absolute left-full top-0 hidden group-hover:flex flex-col bg-white border rounded-md shadow-md z-50 min-w-[160px]">
                      {cities.map((city) => {
                        const activeCity = eqNorm(selectedCity, city);
                        return (
                          <div
                            key={city}
                            onClick={() => handleCitySelect(city, country)}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                              activeCity ? "bg-gray-100" : ""
                            }`}
                          >
                            {city}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Price Range Slider */}
      <div>
        <h3 className="text-lg sm:text-xl lg:text-[20px] font-semibold text-[#212121] mb-3 sm:mb-4">
          Preisspanne
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Von</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={priceRange[0]}
                onChange={(e) => {
                  const newMin = Math.max(
                    0,
                    Math.min(Number(e.target.value), priceRange[1] - 1)
                  );
                  const newRange: [number, number] = [newMin, priceRange[1]];
                  setPriceRange(newRange);
                  debouncedUpdateParams({
                    minPrice: newMin.toString(),
                    maxPrice: priceRange[1].toString(),
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <span className="text-gray-400 mt-6">-</span>
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Bis</label>
              <input
                type="number"
                min="0"
                max="100"
                value={priceRange[1]}
                onChange={(e) => {
                  const newMax = Math.min(
                    100,
                    Math.max(Number(e.target.value), priceRange[0] + 1)
                  );
                  const newRange: [number, number] = [priceRange[0], newMax];
                  setPriceRange(newRange);
                  debouncedUpdateParams({
                    minPrice: priceRange[0].toString(),
                    maxPrice: newMax.toString(),
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
            </div>
          </div>

          <DebouncedSlider
            value={priceRange}
            onChange={(newRange) => {
              updateParams({
                minPrice: newRange[0].toString(),
                maxPrice: newRange[1].toString(),
              });
            }}
            min={0}
            max={100}
          />

          <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
            <span>EUR {Math.round(priceRange[0])}</span>
            <span>EUR {Math.round(priceRange[1])}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              [0, 25],
              [25, 50],
              [50, 75],
              [75, 100],
            ].map(([min, max]) => (
              <button
                key={`${min}-${max}`}
                onClick={() => {
                  const newRange: [number, number] = [min, max];
                  setPriceRange(newRange);
                  updateParams({
                    minPrice: min.toString(),
                    maxPrice: max.toString(),
                  });
                }}
                className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                € {min} - € {max}
              </button>
            ))}
          </div>

          <button
            onClick={resetAllFilters}
            className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );

  FilterSidebar.displayName = "FilterSidebar";

  const getShortOrFallback = (deal: Deal) => {
    const plain =
      (deal.shortDescription && deal.shortDescription.trim()) ||
      (deal.description || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const sentences = plain.match(/[^.!?]+[.!?]+/g);
    if (!sentences) return plain;
    return sentences.slice(0, 3).join(" ").trim();
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="lg:hidden">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-semibold">Filter</h2>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-60px)]">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-10 xl:gap-2">
          <div className="hidden lg:block col-span-6 md:col-span-6 lg:col-span-2">
            <FilterSidebar />
          </div>

          <div className="col-span-6 md:col-span-6 lg:col-span-4">
            {isLoadingDeals ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-80 bg-gray-200 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            ) : dealsError ? (
              <div className="col-span-full text-center py-10">
                <p className="text-red-500">
                  Fehler beim Laden der Angebote. Bitte versuchen Sie es später
                  erneut.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-3 md:space-y-0">
                  {filteredDealsData.length > 0 ? (
                    filteredDealsData.map((deal: Deal) => (
                      <DealsCard
                        id={deal._id}
                        key={deal._id}
                        status={deal.status}
                        title={deal.title}
                        image={deal.images[0] || "/assets/deals.png"}
                        description={getShortOrFallback(deal)}
                        price={deal.price}
                        time={deal.time}
                        createdAt={deal.createdAt}
                        updatedAt={deal.updatedAt}
                        participations={deal.bookingCount}
                        maxParticipants={deal.participationsLimit}
                        scheduleDates={deal.scheduleDates}
                        location={deal.location}
                        timer={deal.timer}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-500">
                        Es wurden keine Walk Throughz gefunden, die deinen
                        Filtern entsprechen.
                      </p>
                    </div>
                  )}
                </div>

                {filteredDealsData.length > 0 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={0}
                      itemsPerPage={0}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}

DealsPage.displayName = "DealsPage";

export default DealsPage;