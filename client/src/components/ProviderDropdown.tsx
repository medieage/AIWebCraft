import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, Check } from "lucide-react";
import { Provider } from "@/lib/providers";
import { UseQueryResult } from "@tanstack/react-query";

interface ProviderDropdownProps {
  providers: Provider[];
  activeProvider: Provider;
  onChange: (provider: Provider) => void;
  apiKeysQuery: UseQueryResult<any, unknown>;
}

export default function ProviderDropdown({ 
  providers, 
  activeProvider, 
  onChange,
  apiKeysQuery
}: ProviderDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-500 hover:bg-blue-500/20 flex items-center gap-1"
        >
          <ChevronDown className="h-4 w-4" />
          {activeProvider.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-56" align="end">
        <Command>
          <CommandList>
            <CommandEmpty>No providers found.</CommandEmpty>
            <CommandGroup>
              {providers.map((provider) => {
                // Check if we have API key for this provider
                const hasApiKey = apiKeysQuery.data?.find(
                  (p: any) => p.provider === provider.id
                )?.hasKey;
                
                return (
                  <CommandItem
                    key={provider.id}
                    onSelect={() => onChange(provider)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {provider.name}
                      {!hasApiKey && (
                        <span className="ml-2 rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-600">
                          Need API key
                        </span>
                      )}
                    </div>
                    {provider.id === activeProvider.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
