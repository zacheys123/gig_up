// app/search/page.tsx (NEW - Main Search Page)
import { ThemeWrapper } from "@/components/pages/themeWrapper";
import SearchHeader from "@/components/search/SearchHeader";
import SearchResultsGrid from "@/components/search/SearchResultsGrid";

const SearchPage = async () => {
  return (
    <ThemeWrapper>
      <div className="min-h-screen pb-20">
        <SearchHeader />
        <SearchResultsGrid />
      </div>
    </ThemeWrapper>
  );
};

export default SearchPage;
