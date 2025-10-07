import CurrentUserProfile from "@/components/userprofile/CurrentUserProfile";

const UserProfile = async () => {
  return (
    <div
      className="sm:w-[95%] mx-auto sm:h-[calc(100vh-30px)] md:h-[calc(100vh-120px)] md:w-[80%] flex
      h-screen flex-col md:flex overflow-hidden items-center shadow-md shadow-slate-500 p-4 w-[93%] md:ml-[35px]"
    >
      <CurrentUserProfile />
    </div>
  );
};

export default UserProfile;
