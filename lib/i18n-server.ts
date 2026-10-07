import "server-only";

import { cookies } from "next/headers";

import { DICTS, isLang, LANG_COOKIE, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : "en";
}

export async function getDict() {
  return DICTS[await getLang()];
}
