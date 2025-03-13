import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { Provider } from "@/lib/providers";
import { useApiKeys } from "@/hooks/useApiKeys";
import { useToast } from "@/hooks/use-toast";

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
}

export default function APIKeyModal({ isOpen, onClose, providers }: APIKeyModalProps) {
  const [selectedProvider, setSelectedProvider] = useState(providers[0].id);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { saveApiKey, isLoading } = useApiKeys();
  const { toast } = useToast();
  
  // Reset form when modal opens or provider changes
  useEffect(() => {
    if (isOpen) {
      setApiKey("");
      setShowKey(false);
    }
  }, [isOpen, selectedProvider]);
  
  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Требуется API Ключ",
        description: "Пожалуйста, введите действительный API ключ",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await saveApiKey({
        provider: selectedProvider,
        apiKey: apiKey.trim()
      });
      
      toast({
        title: "API Ключ Сохранен",
        description: `Ваш ${providers.find(p => p.id === selectedProvider)?.name} API ключ был сохранен.`
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка Сохранения API Ключа",
        description: error instanceof Error ? error.message : "Произошла непредвиденная ошибка",
        variant: "destructive",
      });
    }
  };
  
  const getProviderHelpLink = () => {
    const provider = providers.find(p => p.id === selectedProvider);
    return provider?.docsUrl || "#";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="backdrop-blur-lg bg-background/95 border border-border/50 shadow-[0_0_30px_rgba(139,92,246,0.25)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Управление API Ключами</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="space-y-1">
            <Label htmlFor="provider">Выберите Провайдера</Label>
            <Select 
              value={selectedProvider} 
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите Провайдера" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="apiKey">API Ключ</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                placeholder={`Введите ваш ${providers.find(p => p.id === selectedProvider)?.name} API ключ`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ваш ключ хранится локально и никогда не отправляется на наши серверы.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between pt-2">
          <Button 
            variant="link" 
            className="text-sm text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href={getProviderHelpLink()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Где найти мой ключ?
            </a>
          </Button>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
            >
              Сохранить Ключ
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
