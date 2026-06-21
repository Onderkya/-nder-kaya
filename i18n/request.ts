import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMergedMessages } from "@/lib/messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && (routing.locales as readonly string[]).includes(requested)
      ? requested
      : routing.defaultLocale;

  // Temel JSON + admin panelden yapılan DB override'larını birleştirir.
  return {
    locale,
    messages: await getMergedMessages(locale),
  };
});
