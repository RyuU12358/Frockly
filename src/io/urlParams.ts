export type StartupParams = {
  lang?: "en" | "ja" | "fr";
  formula?: string;
  // future params: mode, etc.
};

export function getStartupParams(): StartupParams {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const out: StartupParams = {};

  // lang
  const l = params.get("lang");
  if (l === "en" || l === "ja" || l === "fr") {
    out.lang = l;
  }

  // formula
  const f = params.get("formula");
  if (f) {
    out.formula = f;
  }

  return out;
}
