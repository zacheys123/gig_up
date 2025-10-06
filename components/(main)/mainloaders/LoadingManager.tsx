// components/loaders/LoadingManager.tsx
import { useLoadingState } from "@/hooks/useLoadingState";
import { FirstTimeLoader } from "./FirstTimeLoader";
import { ReturningLoader } from "./ReturningLoaders";


interface LoadingManagerProps {
  children: React.ReactNode;
}

export function LoadingManager({ children }: LoadingManagerProps) {
  const { loadingState, isLoading } = useLoadingState();

  if (isLoading) {
    return loadingState === "first-time" ? <FirstTimeLoader /> : <ReturningLoader />;
  }

  return <>{children}</>;
}