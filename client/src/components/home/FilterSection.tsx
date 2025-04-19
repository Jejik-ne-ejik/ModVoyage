import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { type MinecraftVersion, type Category } from "@shared/schema";

interface FilterSectionProps {
  onFilterChange: (filters: {
    version?: string;
    category?: string;
    sortBy?: string;
    source?: string;
  }) => void;
}

const FilterSection = ({ onFilterChange }: FilterSectionProps) => {
  const [version, setVersion] = useState<string>("All Versions");
  const [category, setCategory] = useState<string>("All Categories");
  const [source, setSource] = useState<string>("All Sources");
  const [sortBy, setSortBy] = useState<string>("Most Popular");

  const { data: versions = [] } = useQuery<MinecraftVersion[]>({
    queryKey: ["/api/versions"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleApplyFilters = () => {
    onFilterChange({
      version: version !== "All Versions" ? version : undefined,
      category: category !== "All Categories" ? category : undefined,
      source: source !== "All Sources" ? source : undefined,
      sortBy: mapSortByToApi(sortBy),
    });
  };

  const mapSortByToApi = (sortValue: string): string => {
    switch (sortValue) {
      case "Most Popular":
        return "popular";
      case "Recently Updated":
        return "recent";
      case "Newest":
        return "recent";
      case "Downloads":
        return "downloads";
      case "Name (A-Z)":
        return "name";
      default:
        return "popular";
    }
  };

  return (
    <div className="bg-background border-b border-gray-800">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <Label htmlFor="version" className="block text-sm font-medium text-primary">
                Version
              </Label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger id="version" className="mt-1 w-full">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Versions">All Versions</SelectItem>
                  {versions.map((ver) => (
                    <SelectItem key={ver.id} value={ver.version}>
                      {ver.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category" className="block text-sm font-medium text-primary">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="mt-1 w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="source" className="block text-sm font-medium text-primary">
                Source
              </Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source" className="mt-1 w-full">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Sources">All Sources</SelectItem>
                  <SelectItem value="CurseForge">CurseForge</SelectItem>
                  <SelectItem value="Modrinth">Modrinth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort" className="block text-sm font-medium text-primary">
                Sort By
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" className="mt-1 w-full">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Most Popular">Most Popular</SelectItem>
                  <SelectItem value="Recently Updated">Recently Updated</SelectItem>
                  <SelectItem value="Newest">Newest</SelectItem>
                  <SelectItem value="Downloads">Downloads</SelectItem>
                  <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <MinecraftButton
              onClick={handleApplyFilters}
              className="w-full md:w-auto"
            >
              Apply Filters
            </MinecraftButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
