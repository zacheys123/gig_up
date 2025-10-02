import { Providers } from "@/app/providers";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <Providers>
      <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-xl p-6">
          <SignIn />
        </div>
      </div>
    </Providers>
  );
}
