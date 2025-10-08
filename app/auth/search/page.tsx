import OverlaySearch from "@/components/pages/OverlaySearch";
import FormData from "@/components/pages/FormData";
import SearchComponent from "@/components/pages/SearchComponent";

const SearchPage = async () => {
  return (
    <div className=" min-h-screen bg-gradient-to-br from-gray-900 to-black pb-[60px] overflow-hidden">
      <FormData />
      <SearchComponent />
      <OverlaySearch />
    </div>
  );
};

export default SearchPage;
