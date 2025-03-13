import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  models: { id: string; name: string }[];
  selectedModel: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({
  models,
  selectedModel,
  onChange
}: ModelSelectorProps) {
  const selected = models.find((model) => model.id === selectedModel);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost"
          role="combobox"
          size="sm"
          className="h-auto py-0.5 px-1 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <span className="truncate max-w-[150px]">
            {selected?.name || "Выберите модель"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-56" align="end">
        <Command>
          <CommandList>
            <CommandEmpty>Модели не найдены.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.id}
                  onSelect={() => onChange(model.id)}
                  className={cn(
                    "flex items-center justify-between",
                    selectedModel === model.id ? "bg-accent" : ""
                  )}
                >
                  <span className="text-xs">{model.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
