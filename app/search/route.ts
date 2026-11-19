import { defaultLocale } from "@/lib/i18n/config";

export function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = `/${defaultLocale}/search`;
  return new Response(null, { status: 307, headers: { Location: url.pathname + url.search } });
}
