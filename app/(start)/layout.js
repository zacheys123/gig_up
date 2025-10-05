// import { getAuth } from "@clerk/nextjs";
import { Toaster } from "sonner";
import AuthDebug from "@/components/AuthDebug"
const MainLayout = ({ children }) => {
  return (
    <div className="h-screen overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          className: "toast",
        }}
      /><AuthDebug/>
      {children}
    </div>
  );
};

export default MainLayout;
