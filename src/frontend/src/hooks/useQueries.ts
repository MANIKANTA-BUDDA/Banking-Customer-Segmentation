import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Segment } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllSegments() {
  const { actor, isFetching } = useActor();
  return useQuery<Segment[]>({
    queryKey: ["segments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSegments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSegment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (segment: Segment) => {
      if (!actor) throw new Error("No actor");
      return actor.createSegment(segment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateSegment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, segment }: { id: bigint; segment: Segment }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSegment(id, segment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteSegment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSegment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useSeedSegments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedSegments();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
