import { useRouter, useSearchParams } from "next/navigation";

export default function Stream() {
  const router = useRouter();
  console.log("Params: ", useSearchParams());

  return (
    <div>
      <h1>Stream Page</h1>
    </div>
  );
}
