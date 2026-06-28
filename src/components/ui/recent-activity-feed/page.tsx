import { ChevronDown, Table, Webhook, Sparkles, LucideIcon } from "lucide-react";

interface ActivityItem {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
}

const activities: ActivityItem[] = [
  {
    icon: Table,
    title: "Google Sheets node changed",
    description: "Updated mapping for 'Client Name'",
    time: "2 hours ago",
  },
  {
    icon: Webhook,
    title: "Webhook updated",
    description: "URL changed in Production environment",
    time: "5 hours ago",
  },
  {
    icon: Sparkles,
    title: "Prompt modified",
    description: "Changed temperature to 0.7 in AI step",
    time: "Yesterday",
  },
];

export default function RecentActivityFeed() {
  return (
    <div className="rounded-lg border border-default bg-surface-2 p-5">

      {/* Header */}
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-inactive">
        Recent activity feed
      </p>

      {/* Items */}
      <div className="flex flex-col divide-y divide-default">
        {activities.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              {/* Avatar */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-3">
                <Icon size={14} className="text-inactive" />
              </div>

              {/* Body */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-inactive">{item.description}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <button className="mt-3 flex items-center gap-1 text-xs text-inactive hover:text-white transition-colors">
        Show full history
        <ChevronDown size={12} />
      </button>
    </div>
  );
}