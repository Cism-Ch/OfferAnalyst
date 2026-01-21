"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Offer } from "@/types";
import { ApiResponse } from "@/types/api";
import { useEffect } from "react";
import { useQuerySync } from "./use-query-sync";
import { toast } from "sonner";

const STORAGE_KEY = "offeranalyst_saved_offers";
const OFFERS_QUERY_KEY = ["offers"];

export function useSavedOffers() {
  const queryClient = useQueryClient();
  const { notifySync } = useQuerySync();

  const { data: offersResponse, isLoading } = useQuery<ApiResponse<Offer[]>>({
    queryKey: OFFERS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/offers");
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          // Auth error handled by middleware or global handler usually,
          // but we can add specific logic here if needed.
        }
        throw new Error(data.error?.message || "Failed to fetch offers");
      }
      return data;
    },
  });

  const savedOffers = offersResponse?.data || [];

  const saveMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to save offer");
      return data;
    },
    onMutate: async (newOffer) => {
      await queryClient.cancelQueries({ queryKey: OFFERS_QUERY_KEY });
      const previousOffers =
        queryClient.getQueryData<ApiResponse<Offer[]>>(OFFERS_QUERY_KEY);

      if (previousOffers?.data) {
        queryClient.setQueryData<ApiResponse<Offer[]>>(OFFERS_QUERY_KEY, {
          ...previousOffers,
          data: [newOffer, ...previousOffers.data],
        });
      }

      return { previousOffers };
    },
    onError: (err, newOffer, context) => {
      if (context?.previousOffers) {
        queryClient.setQueryData(OFFERS_QUERY_KEY, context.previousOffers);
      }
      toast.error(err.message || "Failed to save offer");
    },
    onSuccess: () => {
      toast.success("Offer saved!");
      notifySync(OFFERS_QUERY_KEY);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OFFERS_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/offers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to delete offer");
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: OFFERS_QUERY_KEY });
      const previousOffers =
        queryClient.getQueryData<ApiResponse<Offer[]>>(OFFERS_QUERY_KEY);

      if (previousOffers?.data) {
        queryClient.setQueryData<ApiResponse<Offer[]>>(OFFERS_QUERY_KEY, {
          ...previousOffers,
          data: previousOffers.data.filter(
            (o) => o.id !== id && o.originalId !== id,
          ),
        });
      }

      return { previousOffers };
    },
    onError: (err, id, context) => {
      if (context?.previousOffers) {
        queryClient.setQueryData(OFFERS_QUERY_KEY, context.previousOffers);
      }
      toast.error(err.message || "Failed to remove offer");
    },
    onSuccess: () => {
      toast.success("Offer removed");
      notifySync(OFFERS_QUERY_KEY);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OFFERS_QUERY_KEY });
    },
  });

  // Migration logic: Move localStorage offers to MongoDB
  useEffect(() => {
    if (typeof window === "undefined") return;

    const localData = window.localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        const parsed: Offer[] = JSON.parse(localData);
        if (parsed.length > 0) {
          console.log(
            `[useSavedOffers] Migrating ${parsed.length} local offers to database...`,
          );

          // Save each local offer to the DB
          Promise.all(parsed.map((offer) => saveMutation.mutateAsync(offer)))
            .then(() => {
              console.log(
                "[useSavedOffers] Migration successful. Clearing local storage.",
              );
              window.localStorage.removeItem(STORAGE_KEY);
            })
            .catch((err) => {
              console.error("[useSavedOffers] Migration failed", err);
            });
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error(
          "[useSavedOffers] Failed to parse local offers for migration",
          e,
        );
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [saveMutation]);

  const saveOffer = (offer: Offer) => {
    saveMutation.mutate(offer);
  };

  const removeOffer = (id: string) => {
    removeMutation.mutate(id);
  };

  const isSaved = (id: string) => {
    return savedOffers.some((o) => o.id === id);
  };

  return {
    savedOffers,
    isLoading,
    saveOffer,
    removeOffer,
    isSaved,
  };
}

/**
 * Hook to fetch specific offers by their IDs.
 * Useful for the Compare page.
 */
export function useSpecificOffers(ids: string[]) {
  return useQuery<ApiResponse<Offer[]>>({
    queryKey: [...OFFERS_QUERY_KEY, "specific", ids.sort().join(",")],
    queryFn: async () => {
      if (ids.length === 0) return { success: true, data: [] };
      const res = await fetch(`/api/offers?ids=${ids.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch specific offers");
      return res.json();
    },
    enabled: ids.length > 0,
  });
}
