// src/components/ui/feedback/DiscordFeedbackCard.tsx
"use client";
import { useState } from "react";
import { MessageSquare, ExternalLink, Star, Bug, Lightbulb, ThumbsUp } from "lucide-react";

type FeedbackType = "general" | "bug" | "feature" | "praise";

const feedbackOptions: { type: FeedbackType; icon: React.ReactNode; label: string; color: string }[] = [
  { type: "praise",  icon: <ThumbsUp size={14} />,   label: "Praise",         color: "text-status-success border-status-success/30 bg-status-success/10 hover:bg-status-success/20" },
  { type: "feature", icon: <Lightbulb size={14} />,  label: "Feature Request", color: "text-status-warning border-status-warning/30 bg-status-warning/10 hover:bg-status-warning/20" },
  { type: "bug",     icon: <Bug size={14} />,         label: "Bug Report",     color: "text-status-error border-status-error/30 bg-status-error/10 hover:bg-status-error/20" },
  { type: "general", icon: <MessageSquare size={14} />, label: "General",      color: "text-brand-blue border-brand-blue/30 bg-brand-blue/10 hover:bg-brand-blue/20" },
];

const DISCORD_INVITE = "https://discord.gg/your-invite-here"; // replace this

export default function DiscordFeedbackCard() {
  // 

  return (
    
    <div id="#feedback" className="mb-10  bg-surface rounded-2xl border border-border overflow-hidden max-w-3xl mx-auto">

  {/* Header */}
  <div className="px-16 py-16 text-center border-b border-border">

    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
      <MessageSquare className="h-7 w-7 text-brand-orange" />
    </div>

    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
      Give us feedback
    </h2>

    <p className="mt-4 max-w-xl mx-auto text-text-muted text-base sm:text-lg">
      Help us improve FlowLens. Report bugs, suggest features, or tell us what
      you'd love to see next.
    </p>

    <a
      href={DISCORD_INVITE}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 inline-flex items-center gap-2 text-sm text-brand-orange hover:text-brand-orange/80 transition"
    >
      Join our Discord Community
      <ExternalLink size={16} />
    </a>

  </div>

  

</div>
  );
}