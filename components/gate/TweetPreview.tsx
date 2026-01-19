import { TWEET_PREVIEW } from "@/lib/constants";

export function TweetPreview() {
  return (
    <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left sm:mb-6 sm:rounded-2xl sm:p-5">
      <div className="mb-2.5 flex items-center gap-2.5 sm:mb-3 sm:gap-3">
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-white/10 sm:h-10 sm:w-10" />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-text sm:text-sm">
            {TWEET_PREVIEW.author}
          </div>
          <div className="truncate text-xs text-muted-dark sm:text-[13px]">
            {TWEET_PREVIEW.handle}
          </div>
        </div>
      </div>
      <p className="mb-2.5 whitespace-pre-line text-[13px] leading-relaxed text-muted sm:mb-3 sm:text-sm">
        {TWEET_PREVIEW.content}
      </p>
      <div className="flex gap-4 text-xs text-muted-dark sm:gap-6 sm:text-[13px]">
        <span>♡ {TWEET_PREVIEW.likes}</span>
        <span>⟲ {TWEET_PREVIEW.retweets}</span>
      </div>
    </div>
  );
}
