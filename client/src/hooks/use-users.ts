import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useSearchUser(username: string) {
  return useQuery({
    queryKey: [api.users.search.path, username],
    queryFn: async () => {
      if (!username) return null;
      const url = buildUrl(api.users.search.path, { username });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to search user");
      return api.users.search.responses[200].parse(await res.json());
    },
    enabled: !!username && username.length > 2,
    retry: false,
  });
}
