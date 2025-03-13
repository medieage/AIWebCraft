import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ProviderConfig, supportedProviders, defaultModels } from "@/lib/provider-config";

interface ProviderSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerConfig: ProviderConfig;
  setProviderConfig: (config: ProviderConfig) => void;
}

export function ProviderSettings({ open, onOpenChange, providerConfig, setProviderConfig }: ProviderSettingsProps) {
  const [formState, setFormState] = useState<ProviderConfig>(providerConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProviderConfig(formState);
    onOpenChange(false);
  };

  const handleProviderChange = (provider: string) => {
    setFormState({
      ...formState,
      provider,
      model: defaultModels[provider][0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphism neon-border max-w-md p-6 mx-4 bg-[#121212] bg-opacity-80 backdrop-blur-xl border-[1px] border-[rgba(255,255,255,0.1)] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-[1px] border-transparent pointer-events-none z-10" 
             style={{ borderImage: "linear-gradient(135deg, #00b3ff, #9f00ff) 1" }} />
        
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">AI Provider Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your AI provider settings to generate website code
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-1">
              Select AI Provider
            </Label>
            <Select 
              value={formState.provider} 
              onValueChange={handleProviderChange}
            >
              <SelectTrigger className="w-full glassmorphism text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
                <SelectValue placeholder="Select AI Provider" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border border-gray-700">
                {supportedProviders.map(provider => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
              {formState.provider} API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={`Enter your ${formState.provider} API key`}
              value={formState.apiKey}
              onChange={(e) => setFormState({ ...formState, apiKey: e.target.value })}
              className="w-full glassmorphism text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {defaultModels[formState.provider]?.length > 0 && (
            <div>
              <Label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">
                {formState.provider} Model
              </Label>
              <Select 
                value={formState.model || defaultModels[formState.provider][0]} 
                onValueChange={(model) => setFormState({ ...formState, model })}
              >
                <SelectTrigger className="w-full glassmorphism text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border border-gray-700">
                  {defaultModels[formState.provider].map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
