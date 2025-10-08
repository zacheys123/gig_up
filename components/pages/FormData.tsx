import { Search } from "lucide-react";
import SearchInput from "./SearchInput";

const FormData = () => {
  return (
    <form className="w-full h-[70px] fixed bg-gradient-to-r from-black to-gray-900 z-50 shadow-lg">
      <div className="flex justify-center items-center w-full max-w-4xl mx-auto h-full px-4">
        <div className="flex items-center w-full h-12 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-emerald-700 hover:border-gray-600 transition-all duration-300 px-4">
          <Search
            size="17px"
            style={{ color: "white" }}
            className="text-yellow-200 my-6"
          />
          <SearchInput />
        </div>
      </div>
    </form>
  );
};

export default FormData;
