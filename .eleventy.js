import { lastModifiedISO, lastCommitHash, isRepo } from "./utils/git.mjs";

export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  );

  eleventyConfig.addCollection("liturgy", (api) =>
    api.getFilteredByGlob("liturgy/**/*.md").sort((a, b) =>
      (a.data.title || a.fileSlug).localeCompare(b.data.title || b.fileSlug)
    )
  );

  // already added earlier:
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // ── NEW: git metadata for current page ──────────────────────────────
  eleventyConfig.addShortcode("lastUpdated", (inputPath) => {
    if (!isRepo()) return "";
    const iso = lastModifiedISO(inputPath);
    if (!iso) return "";
    const d = new Date(iso).toLocaleString("en-US", {
      year:"numeric", month:"short", day:"numeric"
    });
    return d;
  });

  eleventyConfig.addShortcode("lastCommit", (inputPath, site) => {
    if (!isRepo()) return "";
    const hash = lastCommitHash(inputPath);
    if (!hash) return "";
    const short = hash.slice(0, 7);
    const base = site?.repo?.web;
    if (base) return `<a href="${base}/commit/${hash}">${short}</a>`;
    return short;
  });
  // ───────────────────────────────────────────────────────────────────

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk"
  };
}
