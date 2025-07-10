"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import Hideon from "@/Provider/Hideon";

interface Category {
  _id: string;
  categoryName: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Location {
  country: string;
  city: string;
}

interface CountryWithCities {
  country: string;
  cities: string[];
}

interface Deal {
  time: number | undefined;
  bookingCount: number;
  participationsLimit: number | undefined;
  _id: string;
  title: string;
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
}


// Custom hook for managing URL parameters (same as in DealsPage)
function useURLParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Always reset to page 1 when filters change (except when only page is being updated)
      if (!updates.page && Object.keys(updates).length > 0) {
        params.set("page", "1");
      }

      const queryString = params.toString();
      router.push(`/deals?${queryString}`, { scroll: false });
    },
    [router, searchParams]
  );

  return { searchParams, updateParams };
}

export function CategoriesAndSearchBar() {
  const { searchParams, updateParams } = useURLParams();
  const axiosInstance = useAxios();

  // Get current filter values from URL
  const currentCategory = searchParams.get("categoryName") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSearchQuery = searchParams.get("search") || "";

  // Local state - synchronized with URL
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  // Sync state with URL params whenever they change
  useEffect(() => {
    setSearchQuery(currentSearchQuery);
    setSelectedCategory(currentCategory);
    setSelectedCountry(currentCountry);
    setSelectedCity(currentCity);
  }, [currentSearchQuery, currentCategory, currentCountry, currentCity]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    const newCategory = category === selectedCategory ? "" : category;
    setSelectedCategory(newCategory);
    updateParams({ categoryName: newCategory });
  };

  // Handle country selection
  const handleCountrySelect = (country: string) => {
    const newCountry = country === selectedCountry ? "" : country;
    setSelectedCountry(newCountry);
    setSelectedCity(""); // Clear city when country changes
    updateParams({
      country: newCountry,
      city: null, // Clear city param
    });
  };

  // Handle city selection
  const handleCitySelect = (city: string, country: string) => {
    const newCity = city === selectedCity ? "" : city;
    setSelectedCity(newCity);
    setSelectedCountry(country); // Set country when city is selected
    updateParams({
      city: newCity,
      country: country, // Ensure country is set
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchQuery.trim() });
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedCity("");

    // Clear search-related params but preserve others
    updateParams({
      search: null,
      categoryName: null,
      country: null,
      city: null,
    });
  };

  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateParams({ search: searchQuery.trim() });
    }
  };

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/api/categories");
        return data || [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
  });

  // Fetch deals to get unique locations
  const { data: dealsData } = useQuery({
    queryKey: ["deals-locations"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get("/api/deals");
        return data.deals || [];
      } catch (error) {
        console.error("Error fetching deals:", error);
        return [];
      }
    },
  });

  // Group locations by country
  const locations: Location[] =
    dealsData
      ?.map((deal: Deal) => ({
        country: deal.location?.country,
        city: deal.location?.city,
      }))
      .filter((loc: Location) => loc.country && loc.city) || [];

  const uniqueLocations: CountryWithCities[] = Array.from(
    new Map(
      locations.reduce((acc: Map<string, string[]>, { country, city }) => {
        const cities = acc.get(country) || [];
        if (!cities.includes(city)) {
          cities.push(city);
        }
        return acc.set(country, cities);
      }, new Map())
    )
  ).map(([country, cities]) => ({ country, cities: [...cities].sort() }));

  const HIDDEN_ROUTES = [
    "/dashboard",
    "/login",
    "/sign-up",
    "/reset-password",
    "/forgot-password",
  ];

  // Get display text for location button
  const getLocationDisplayText = () => {
    if (selectedCity) return selectedCity;
    if (selectedCountry) return selectedCountry;
    return "Frankfurt am Main";
  };

  return (
    <div className="sticky top-[100px] z-50 bg-[#212121] w-full">
      <Hideon routes={HIDDEN_ROUTES}>
        <div className="">
          <header className="container py-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-8">
                {/* Categories Dropdown */}
                <div className="col-span-4 md:col-span-4 lg:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-transparent border-white text-white h-[52px] hover:bg-gray-800 hover:text-white w-full justify-between"
                      >
                        <span>{selectedCategory || "Kategorien"}</span>
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[270px]">
                      <DropdownMenuItem
                        onClick={() => handleCategorySelect("")}
                        className={!selectedCategory ? "bg-gray-100" : ""}
                      >
                        Frankfurt am Main
                      </DropdownMenuItem>
                      {isLoadingCategories ? (
                        <DropdownMenuItem disabled>
                          Loading categories...
                        </DropdownMenuItem>
                      ) : (
                        categoriesData?.data?.map((category: Category) => (
                          <DropdownMenuItem
                            key={category._id}
                            onClick={() =>
                              handleCategorySelect(category.categoryName)
                            }
                            className={
                              selectedCategory === category.categoryName
                                ? "bg-gray-100"
                                : ""
                            }
                          >
                            {category.categoryName}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="col-span-4 md:col-span-4 lg:col-span-3">
                  {/* Search Input and Location Dropdown */}
                  <div className="flex items-center border border-white justify-between rounded-lg">
                    <div className="relative flex-1 max-w-2xl">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by title..."
                        className="pl-10 pr-10 placeholder:text-[12px] lg:placeholder:text-[14px] bg-transparent !text-white border-transparent placeholder:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                      />
                      {(searchQuery ||
                        selectedCategory ||
                        selectedCountry ||
                        selectedCity) && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                          aria-label="Clear search and filters"
                        >
                          <X className="h-4 w-4 stroke-2" />
                        </button>
                      )}
                    </div>
                    {/* Location Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-white py-[25px] lg:h-[52px] text-black !rounded-l-none hover:bg-gray-100 border-0 gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>{getLocationDisplayText()}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="p-0 max-w-[200px] z-50 overflow-visible"
                      >
                        {/* All Locations */}
                        <div
                          onClick={() => {
                            handleCountrySelect("");
                            handleCitySelect("", "");
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            !selectedCountry && !selectedCity
                              ? "bg-gray-100"
                              : ""
                          }`}
                        >
                          Frankfurt am Main
                        </div>

                        {/* Countries and Cities */}
                        {uniqueLocations.map(({ country, cities }) => (
                          <div key={country} className="relative group">
                            {/* Country Item */}
                            <div
                              onClick={() => handleCountrySelect(country)}
                              className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                selectedCountry === country && !selectedCity
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <span>{country}</span>
                              <ChevronDown className="h-4 w-4 transform group-hover:rotate-180 transition-transform" />
                            </div>

                            {/* Submenu: Cities */}
                            <div className="absolute left-full top-0 hidden group-hover:flex flex-col bg-white border rounded-md shadow-md z-50 min-w-[160px]">
                              {cities.map((city) => (
                                <div
                                  key={city}
                                  onClick={() =>
                                    handleCitySelect(city, country)
                                  }
                                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                    selectedCity === city ? "bg-gray-100" : ""
                                  }`}
                                >
                                  {city}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </form>
          </header>
        </div>
      </Hideon>
    </div>
  );
}
