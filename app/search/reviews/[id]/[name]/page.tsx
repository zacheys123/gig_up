import FriendReviewComponent from "@/components/friend/FriendReviewComponent";

const FriendReviews = () => {
  return (
    <div className=" w-[100vw] h-[86%] bg-slate-900 overflow-y-auto">
      <FriendReviewComponent rev={true} />
    </div>
  );
};

export default FriendReviews;
