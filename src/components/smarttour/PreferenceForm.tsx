import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INTERESTS } from "@/lib/smarttour/constants";
import { ACTIVITY_LABELS, INDOOR_LABELS, TRANSPORT_LABELS } from "@/lib/smarttour/prefs";
import { formatINR } from "@/lib/smarttour/recommendation";
import type { InterestId, UserPreferences } from "@/lib/smarttour/types";
import { cn } from "@/lib/utils";

interface PreferenceFormProps {
  value: UserPreferences;
  onChange: (next: UserPreferences) => void;
  compact?: boolean;
}

export function PreferenceForm({ value, onChange, compact = false }: PreferenceFormProps) {
  const toggleInterest = (id: InterestId) => {
    const has = value.interests.includes(id);
    onChange({
      ...value,
      interests: has ? value.interests.filter((i) => i !== id) : [...value.interests, id],
    });
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold">Interests</legend>
        <p className="mt-1 text-xs text-muted-foreground">
          Weighted at 30% of every recommendation score. Leave empty for general picks.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const active = value.interests.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-glass text-foreground hover:bg-glass-strong",
                )}
              >
                {interest.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className={cn("grid gap-6", compact ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="budget">Total budget</Label>
            <span className="text-sm font-semibold text-primary">{formatINR(value.budget)}</span>
          </div>
          <Slider
            id="budget"
            className="mt-3"
            min={0}
            max={100000}
            step={500}
            value={[value.budget]}
            onValueChange={([budget]) => onChange({ ...value, budget: budget ?? 0 })}
            aria-label="Total trip budget in rupees"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="days">Trip length</Label>
            <span className="text-sm font-semibold text-primary">
              {value.days} {value.days === 1 ? "day" : "days"}
            </span>
          </div>
          <Slider
            id="days"
            className="mt-3"
            min={1}
            max={14}
            step={1}
            value={[value.days]}
            onValueChange={([days]) => onChange({ ...value, days: days ?? 1 })}
            aria-label="Number of days"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="distance">Max travel distance</Label>
            <span className="text-sm font-semibold text-primary">{value.maxDistanceKm} km</span>
          </div>
          <Slider
            id="distance"
            className="mt-3"
            min={2}
            max={100}
            step={1}
            value={[value.maxDistanceKm]}
            onValueChange={([km]) => onChange({ ...value, maxDistanceKm: km ?? 10 })}
            aria-label="Maximum travel distance in kilometres"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transport">Preferred transport</Label>
          <Select
            value={value.transport}
            onValueChange={(transport) =>
              onChange({ ...value, transport: transport as UserPreferences["transport"] })
            }
          >
            <SelectTrigger id="transport" className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TRANSPORT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity">Activity pace</Label>
          <Select
            value={value.activityType}
            onValueChange={(activityType) =>
              onChange({ ...value, activityType: activityType as UserPreferences["activityType"] })
            }
          >
            <SelectTrigger id="activity" className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="indoor">Indoor / outdoor</Label>
          <Select
            value={value.indoorPreference}
            onValueChange={(indoorPreference) =>
              onChange({
                ...value,
                indoorPreference: indoorPreference as UserPreferences["indoorPreference"],
              })
            }
          >
            <SelectTrigger id="indoor" className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INDOOR_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
