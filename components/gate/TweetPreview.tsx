import { TWEET_PREVIEW } from "@/lib/constants";

export function TweetPreview() {
  return (
    <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10" />
        <div>
          <div className="text-sm font-semibold text-text">
            {TWEET_PREVIEW.author}
          </div>
          <div className="text-[13px] text-muted-dark">
            {TWEET_PREVIEW.handle}
          </div>
        </div>
      </div>
      <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-muted">
        {TWEET_PREVIEW.content}
      </p>
      <div className="flex gap-6 text-[13px] text-muted-dark">
        <span>♡ {TWEET_PREVIEW.likes}</span>
        <span>⟲ {TWEET_PREVIEW.retweets}</span>
      </div>
    </div>
  );
}
