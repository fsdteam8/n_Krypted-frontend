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

/* ===================== Types ===================== */
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
  country: string; // display label
  cities: string[]; // display labels
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

/* ===================== Helpers ===================== */
const normalizeKey = (s?: string | null) =>
  (s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

const prettyLabel = (s?: string | null) => {
  const base = (s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
  // Title-case words (unicode safe) and keep hyphenated compounds nice
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

/* ============ URL Params Hook (canonical writes) ============ */
function useURLParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        const canon = value == null ? null : prettyLabel(value);
        if (!canon || canon === "all") {
          params.delete(key);
        } else {
          params.set(key, canon);
        }
      });
      if (!updates.page && Object.keys(updates).length > 0) {
        params.set("page", "1");
      }
      router.push(`/deals?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
  return { searchParams, updateParams };
}

/* ===================== Component ===================== */
export function CategoriesAndSearchBar() {
  const { searchParams, updateParams } = useURLParams();
  const axiosInstance = useAxios();

  // Current filter values from URL (raw)
  const currentCategory = searchParams.get("categoryName") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSearchQuery = searchParams.get("search") || "";

  // Local state
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  // Sync when URL params change
  useEffect(() => {
    setSearchQuery(currentSearchQuery);
    setSelectedCategory(currentCategory);
    setSelectedCountry(currentCountry);
    setSelectedCity(currentCity);
  }, [currentSearchQuery, currentCategory, currentCountry, currentCity]);

  // Handlers
  const handleCategorySelect = (category: string) => {
    const newCategory = eqNorm(category, selectedCategory)
      ? ""
      : prettyLabel(category);
    setSelectedCategory(newCategory);
    updateParams({ categoryName: newCategory || null });
  };

  const handleCountrySelect = (country: string) => {
    const newCountry = eqNorm(country, selectedCountry)
      ? ""
      : prettyLabel(country);
    setSelectedCountry(newCountry);
    setSelectedCity(""); // Clear city when country changes
    updateParams({
      country: newCountry || null,
      city: null,
    });
  };

  const handleCitySelect = (city: string, country: string) => {
    const newCity = eqNorm(city, selectedCity) ? "" : prettyLabel(city);
    const canonCountry = prettyLabel(country);
    setSelectedCity(newCity);
    setSelectedCountry(canonCountry); // Ensure country is set
    updateParams({
      city: newCity || null,
      country: canonCountry || null,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    updateParams({ search: q || null });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedCity("");
    updateParams({
      search: null,
      categoryName: null,
      country: null,
      city: null,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = searchQuery.trim();
      updateParams({ search: q || null });
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

  // Fetch deals (all) to build Location menu
  const { data: dealsData } = useQuery({
    queryKey: ["deals-all"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/deals", {
        params: {
          page: 1,
          limit: 100000,
          showAll: true, // 👈 added here
        },
      });
      return data.deals || [];
    },
  });

  // Build unique Countries → Cities (defensive, though backend now sanitizes)
  const uniqueLocations: CountryWithCities[] = (() => {
    const locs: Location[] =
      dealsData
        ?.map((d: Deal) => ({
          country: d.location?.country,
          city: d.location?.city,
        }))
        .filter((l: Location) => l.country && l.city) || [];

    const countryMap = new Map<
      string,
      { label: string; cities: Map<string, string> }
    >();

    for (const { country, city } of locs) {
      const cKey = normalizeKey(country);
      const cityKey = normalizeKey(city);
      if (!cKey || !cityKey) continue;

      if (!countryMap.has(cKey)) {
        countryMap.set(cKey, {
          label: prettyLabel(country),
          cities: new Map(),
        });
      }
      const entry = countryMap.get(cKey)!;
      if (!entry.cities.has(cityKey))
        entry.cities.set(cityKey, prettyLabel(city));
    }

    // to array + sort
    const arr: CountryWithCities[] = Array.from(countryMap.values()).map(
      (v) => ({
        country: v.label,
        cities: Array.from(v.cities.values()).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        ),
      })
    );

    arr.sort((a, b) =>
      a.country.localeCompare(b.country, undefined, { sensitivity: "base" })
    );
    return arr;
  })();

  const HIDDEN_ROUTES = [
    "/dashboard",
    "/login",
    "/sign-up",
    "/reset-password",
    "/forgot-password",
    "/verify-email",
    "/verify-otp",
  ];

  const getLocationDisplayText = () => {
    if (selectedCity) return prettyLabel(selectedCity);
    if (selectedCountry) return prettyLabel(selectedCountry);
    return "Alle Städte";
  };

  return (
    <div className="sticky top-[100px] z-50 bg-[#212121] w-full">
      <Hideon routes={HIDDEN_ROUTES}>
        <div>
          <header className="container py-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-8">
                {/* Categories */}
                <div className="col-span-4 md:col-span-4 lg:col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-transparent border-white text-white h-[52px] hover:bg-white/10 hover:border-white/10 hover:text-white w-full justify-between"
                      >
                        <span>{selectedCategory || "Kategorien"}</span>
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[270px]">
                      <DropdownMenuItem
                        onClick={() => handleCategorySelect("")}
                        className={!selectedCategory ? "bg-neutral-100" : ""}
                      >
                        Alle
                      </DropdownMenuItem>
                      {isLoadingCategories ? (
                        <DropdownMenuItem disabled>
                          Loading categories...
                        </DropdownMenuItem>
                      ) : (
                        categoriesData?.data?.map((category: Category) => {
                          const label = prettyLabel(category.categoryName);
                          const active = eqNorm(selectedCategory, label);
                          return (
                            <DropdownMenuItem
                              key={category._id}
                              onClick={() => handleCategorySelect(label)}
                              className={active ? "bg-neutral-100" : ""}
                            >
                              {label}
                            </DropdownMenuItem>
                          );
                        })
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Search + Location */}
                <div className="col-span-4 md:col-span-4 lg:col-span-3">
                  <div className="flex items-center border border-white justify-between rounded-lg">
                    {/* Search */}
                    <div className="relative flex-1 max-w-2xl">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Suche nach Titel..."
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white/20"
                          aria-label="Clear search and filters"
                        >
                          <X className="h-4 w-4 stroke-2" />
                        </button>
                      )}
                    </div>

                    {/* Location */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-white py-[25px] lg:h-[52px] text-black !rounded-l-none hover:bg-neutral-50 border-0 gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>{getLocationDisplayText()}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="p-0 max-w-[220px] z-50 overflow-visible"
                      >
                        {uniqueLocations.map(({ country, cities }) => {
                          const isActiveCountry =
                            eqNorm(selectedCountry, country) && !selectedCity;
                          return (
                            <div key={country} className="relative group">
                              {/* Country */}
                              <div
                                onClick={() => handleCountrySelect(country)}
                                className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-neutral-100 ${
                                  isActiveCountry ? "bg-neutral-100" : ""
                                }`}
                              >
                                <span>{country}</span>
                                <ChevronDown className="h-4 w-4 transform group-hover:rotate-180 transition-transform" />
                              </div>
                              {/* Cities submenu */}
                              <div className="absolute top-full left-0 w-full md:w-auto md:min-w-[180px] lg:left-full lg:top-0 hidden group-hover:flex flex-col bg-white border rounded-md shadow-md z-50">
                                {cities.map((city) => {
                                  const activeCity = eqNorm(selectedCity, city);
                                  return (
                                    <div
                                      key={city}
                                      onClick={() =>
                                        handleCitySelect(city, country)
                                      }
                                      className={`px-4 py-2 cursor-pointer hover:bg-neutral-100 ${
                                        activeCity ? "bg-neutral-100" : ""
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
