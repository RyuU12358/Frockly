// src/search/index.ts
export type Lang = "en" | "jp";

export type SearchHit = {
  fn: string;
  score: number;
};

export type SearchOptions = {
  lang?: Lang;     // default: "en"
  limit?: number;  // default: 7
};

export async function searchFunctions(
  query: string,
  opt: SearchOptions = {}
): Promise<SearchHit[]> {
  const lang = opt.lang ?? "en";
  const limit = opt.limit ?? 7;

  switch (lang) {
    case "jp": {
      // JPは後で実装したら差し替え
      // const { searchFunctionsJP } = await import("./jp/searchFunctionsJP");
      // return searchFunctionsJP(query, limit);
      return [];
    }
    case "en":
    default: {
      const { searchFunctionsEN } = await import("./en/searchFunctionsEN");
      return searchFunctionsEN(query, limit);
    }
  }
}
