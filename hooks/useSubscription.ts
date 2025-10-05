// hooks/useSubscription.ts
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch subscription data");
    throw error;
  }
  return res.json();
};

export function useSubscription(clerkId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    clerkId ? `/api/user/subscription?clerkId=${clerkId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );

  return {
    subscription: data,
    isLoading,
    isError: error,
    mutateSubscription: mutate,
  };
}
