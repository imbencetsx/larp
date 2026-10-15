"use client";
import { createContext, useContext, type ReactNode } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
type Overview = RouterOutputs["learning"]["overview"];
const LearningContext = createContext<{
  data: Overview | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<unknown>;
  authEnabled: boolean;
}>({
  data: undefined,
  loading: true,
  error: null,
  refresh: async () => undefined,
  authEnabled: false,
});
export function LearningProvider({
  children,
  authEnabled,
}: {
  children: ReactNode;
  authEnabled: boolean;
}) {
  const query = api.learning.overview.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
  });
  return (
    <LearningContext.Provider
      value={{
        data: query.data,
        loading: query.isLoading,
        error: query.error?.message ?? null,
        refresh: query.refetch,
        authEnabled,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}
export function useLearning() {
  return useContext(LearningContext);
}
