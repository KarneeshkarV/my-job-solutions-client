import { LinkButton } from "@/components/ui/button";
import { getDict } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await getDict();
  return (
    <div className="wrap py-24 md:py-32">
      <p className="eyebrow num">404</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">{t.notFound.title}</h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">{t.notFound.body}</p>
      <div className="mt-8 flex gap-2">
        <LinkButton href="/">{t.notFound.home}</LinkButton>
        <LinkButton href="/jobs" variant="secondary">{t.common.viewAll}</LinkButton>
      </div>
    </div>
  );
}
