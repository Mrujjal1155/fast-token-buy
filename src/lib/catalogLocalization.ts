import { supabase } from "@/integrations/supabase/client";

export type LocalizedCatalogLang = "en" | "bn";

export interface PackageTextEntry {
  savings?: string;
}

export interface ReserveTextEntry {
  label?: string;
}

export type PackageTextMap = Record<string, PackageTextEntry>;
export type ReserveTextMap = Record<string, ReserveTextEntry>;

const SETTING_KEYS = {
  packages: {
    en: "content_packages_en",
    bn: "content_packages_bn",
  },
  reserves: {
    en: "content_reserves_en",
    bn: "content_reserves_bn",
  },
} as const;

const EN_DIGITS = "0123456789";
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

const normalizeText = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? "";

const hasBanglaText = (value: string) => /[\u0980-\u09FF]/.test(value);

const convertDigits = (value: string, lang: LocalizedCatalogLang) =>
  value.replace(/[0-9০-৯]/g, (char) => {
    const sourceDigits = /[০-৯]/.test(char) ? BN_DIGITS : EN_DIGITS;
    const digitIndex = sourceDigits.indexOf(char);
    if (digitIndex < 0) return char;
    return lang === "bn" ? BN_DIGITS[digitIndex] : EN_DIGITS[digitIndex];
  });

const toAsciiDigits = (value: string) => convertDigits(value, "en");

const extractFirstNumber = (value: string) => toAsciiDigits(value).match(/\d+/)?.[0] ?? "";

const extractPercent = (value: string) => toAsciiDigits(value).match(/(\d+)\s*%/)?.[1] ?? extractFirstNumber(value);

const parseSettingValue = <T extends Record<string, unknown>>(raw?: string | null): T => {
  if (!raw) return {} as T;

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as T;
    }
  } catch {
    return {} as T;
  }

  return {} as T;
};

const loadSettingMaps = async <T extends Record<string, unknown>>(
  keyMap: Record<LocalizedCatalogLang, string>
): Promise<Record<LocalizedCatalogLang, T>> => {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", Object.values(keyMap));

  return {
    en: parseSettingValue<T>(data?.find((row) => row.key === keyMap.en)?.value),
    bn: parseSettingValue<T>(data?.find((row) => row.key === keyMap.bn)?.value),
  };
};

const saveSettingMap = async <T extends Record<string, unknown>>(key: string, value: T) => {
  const serializedValue = JSON.stringify(value);

  const { data: existing, error: existingError } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", key)
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value: serializedValue, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("site_settings").insert({ key, value: serializedValue });
  if (error) throw error;
};

export const loadPackageTextMaps = () => loadSettingMaps<PackageTextMap>(SETTING_KEYS.packages);

export const loadReserveTextMaps = () => loadSettingMaps<ReserveTextMap>(SETTING_KEYS.reserves);

export const savePackageTextMap = (lang: LocalizedCatalogLang, value: PackageTextMap) =>
  saveSettingMap(SETTING_KEYS.packages[lang], value);

export const saveReserveTextMap = (lang: LocalizedCatalogLang, value: ReserveTextMap) =>
  saveSettingMap(SETTING_KEYS.reserves[lang], value);

export const buildPackageSavingsFallback = ({
  value,
  lang,
  popular,
}: {
  value?: string | null;
  lang: LocalizedCatalogLang;
  popular?: boolean;
}) => {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  const alreadyMatchesLang = lang === "bn" ? hasBanglaText(normalized) : !hasBanglaText(normalized);
  if (alreadyMatchesLang) return normalized;

  const percent = extractPercent(normalized);
  if (!percent) return normalized;

  return lang === "bn"
    ? `${convertDigits(percent, "bn")}% সাশ্রয়${popular ? " — সেরা ডিল!" : ""}`
    : `${convertDigits(percent, "en")}% savings${popular ? " — best deal!" : ""}`;
};

export const buildReserveLabelFallback = ({
  value,
  lang,
}: {
  value?: string | null;
  lang: LocalizedCatalogLang;
}) => {
  const normalized = normalizeText(value);
  if (!normalized) return lang === "bn" ? "০ ক্রেডিট" : "0 Credits";

  const credits = extractFirstNumber(normalized);
  if (!credits) return normalized;

  return lang === "bn"
    ? `${convertDigits(credits, "bn")} ক্রেডিট`
    : `${convertDigits(credits, "en")} Credits`;
};

export const getPackageSavingsText = (
  map: PackageTextMap,
  packageKey: string,
  fallbackText: string
) => normalizeText(map[packageKey]?.savings) || fallbackText;

export const getReserveLabelText = (
  map: ReserveTextMap,
  reserveId: string,
  fallbackText: string
) => normalizeText(map[reserveId]?.label) || fallbackText;