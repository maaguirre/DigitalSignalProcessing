export type Language = "pt" | "en";

export type Localized = { pt: string; en: string };

export function pick(text: Localized, language: Language): string {
  return text[language];
}
