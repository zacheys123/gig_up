import AuthDebug from "@/components/AuthDebug"
const MainLayout = ({ children }) => {
  return (
    <div className="h-screen overflow-x-hidden">
  <AuthDebug/>
      {children}
    </div>
  );
};

export default MainLayout;
