import { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  user: { id: number; name: string; email: string; phone?: string | null } | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe({ query: { retry: false } } as any);
  const logoutMutation = useLogout();

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  }, [queryClient]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(getGetMeQueryKey(), null);
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  }, [logoutMutation, queryClient]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
