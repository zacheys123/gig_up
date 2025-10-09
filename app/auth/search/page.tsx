// SearchPage.tsx (server component)
import OverlaySearch from "@/components/pages/OverlaySearch";
import FormData from "@/components/pages/FormData";
import SearchComponent from "@/components/pages/SearchComponent";
import { ThemeWrapper } from "@/components/pages/themeWrapper";

const SearchPage = async () => {
  return (
    <ThemeWrapper>
      <div className="pb-[60px] overflow-hidden">
        <FormData />
        <SearchComponent />
        {/* <OverlaySearch /> */}
      </div>
    </ThemeWrapper>
  );
};

export default SearchPage;
