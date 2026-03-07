"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/button";

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get("roomId");
  const hotelId = searchParams.get("hotelId");

  useEffect(() => {
    if (hotelId) {
      router.replace(`/room-details?hotelId=${hotelId}`);
    } else {
      router.replace("/rooms");
    }
  }, [hotelId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}
