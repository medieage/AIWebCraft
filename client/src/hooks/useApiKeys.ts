import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useApiKeys() {
  const { toast } = useToast();
  
  // Query to get API keys status
  const apiKeysQuery = useQuery({
    queryKey: ['/api/keys'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation to save an API key
  const { mutateAsync: saveApiKey, isPending: isLoading } = useMutation({
    mutationFn: async (data: { provider: string; apiKey: string }) => {
      const res = await apiRequest('POST', '/api/keys', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving API key",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  return {
    apiKeysQuery,
    saveApiKey,
    isLoading
  };
}
