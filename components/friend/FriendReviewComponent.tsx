"use client";
import AllReview from "@/components/reviews/allreviews/AllReview";
import { Review, UserProps } from "@/types/userinterfaces";
import { ArrowBigLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type friend = {
  rev: boolean;
};
const FriendReviewComponent = ({ rev }: friend) => {
  const { id } = useParams();
  const [friendReviews, setFriendReviews] = useState<Review[]>();
  const router = useRouter();
  useEffect(() => {
    if (!id) {
      // Guard: Do not run the effect if `id` is undefined or null
      return;
    }

    let isMounted = true;

    async function getFriend() {
      try {
        const response = await fetch(`/api/user/getuser/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const friendData: UserProps = await response.json();
        if (isMounted) {
          setFriendReviews(friendData?.allreviews || []);
        }
      } catch (error) {
        console.error("Error fetching reviews data:", error);
        alert("Error fetching reviews data");
        if (isMounted) {
          setFriendReviews([
            {
              _id: "",
              comment: "",
              gigId: "",
              rating: 0,
              postedBy: "",
              postedTo: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }

        // Optional: Notify user about the error
      }
    }

    getFriend();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div
      className={
        rev
          ? `w-[90%] h-[90vh] bg-slate-900 overflow-y-auto mx-auto`
          : `w-[100%] h-[70vh] bg-slate-900 overflow-y-auto mx-auto`
      }
    >
      {rev && (
        <div className="h-[30px] bg-slate-900 w-full flex pl-3 items-center">
          <ArrowBigLeftIcon
            className="cursor-pointer hover:text-amber-500 text-neutral-400 "
            size="24"
            onClick={() => router.back()}
          />
        </div>
      )}
      <div className="text-gray-300 h-full py-2 bg-neutral-900  overflow-y-auto">
        {friendReviews && friendReviews?.length > 0 ? (
          <>
            {friendReviews?.map((review: Review) => (
              <AllReview key={review?._id} {...review} w={"350px"} />
            ))}
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <h2 className="text-gray-500">No reviews found.</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendReviewComponent;
