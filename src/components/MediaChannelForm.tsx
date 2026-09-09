import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, Sparkles } from "lucide-react";

interface MediaChannelFormProps {
  channelName: string;
  channelIcon: React.ReactNode;
  budget: number;
  cpm?: number;
  cpc?: number;
  ctr: number;
  conversionRate: number;
  onBudgetChange: (value: number) => void;
  onCpmChange?: (value: number) => void;
  onCpcChange?: (value: number) => void;
  onCtrChange: (value: number) => void;
  onConversionRateChange: (value: number) => void;
  onAskAI: () => void;
}

export function MediaChannelForm({
  channelName,
  channelIcon,
  budget,
  cpm,
  cpc,
  ctr,
  conversionRate,
  onBudgetChange,
  onCpmChange,
  onCpcChange,
  onCtrChange,
  onConversionRateChange,
  onAskAI,
}: MediaChannelFormProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {channelIcon}
            {channelName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAskAI}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Ask AI
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${channelName}-budget`} className="text-xs">
              Budget
            </Label>
            <Input
              id={`${channelName}-budget`}
              type="number"
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="mt-1"
              min="0"
              step="1000"
            />
            <p className="text-xs text-slate-500 mt-1">{formatCurrency(budget)}</p>
          </div>

          {cpm !== undefined && onCpmChange && (
            <div>
              <Label htmlFor={`${channelName}-cpm`} className="text-xs flex items-center gap-1">
                CPM
                <HelpCircle className="h-3 w-3 text-slate-400" />
              </Label>
              <Input
                id={`${channelName}-cpm`}
                type="number"
                value={cpm}
                onChange={(e) => onCpmChange(Number(e.target.value))}
                className="mt-1"
                min="0"
                step="0.1"
              />
              <p className="text-xs text-slate-500 mt-1">${cpm.toFixed(2)}</p>
            </div>
          )}

          {cpc !== undefined && onCpcChange && (
            <div>
              <Label htmlFor={`${channelName}-cpc`} className="text-xs flex items-center gap-1">
                CPC
                <HelpCircle className="h-3 w-3 text-slate-400" />
              </Label>
              <Input
                id={`${channelName}-cpc`}
                type="number"
                value={cpc}
                onChange={(e) => onCpcChange(Number(e.target.value))}
                className="mt-1"
                min="0"
                step="0.1"
              />
              <p className="text-xs text-slate-500 mt-1">${cpc.toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${channelName}-ctr`} className="text-xs flex items-center gap-1">
              CTR (%)
              <HelpCircle className="h-3 w-3 text-slate-400" />
            </Label>
            <Input
              id={`${channelName}-ctr`}
              type="number"
              value={ctr}
              onChange={(e) => onCtrChange(Number(e.target.value))}
              className="mt-1"
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-xs text-slate-500 mt-1">{ctr.toFixed(2)}%</p>
          </div>

          <div>
            <Label htmlFor={`${channelName}-conversion`} className="text-xs flex items-center gap-1">
              Conversion (%)
              <HelpCircle className="h-3 w-3 text-slate-400" />
            </Label>
            <Input
              id={`${channelName}-conversion`}
              type="number"
              value={conversionRate}
              onChange={(e) => onConversionRateChange(Number(e.target.value))}
              className="mt-1"
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-xs text-slate-500 mt-1">{conversionRate.toFixed(2)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}