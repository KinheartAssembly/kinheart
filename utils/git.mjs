import { execSync } from "node:child_process";
const run = (cmd) => {
  try { return execSync(cmd, { stdio: ["ignore","pipe","ignore"] }).toString().trim(); }
  catch { return ""; }
};

export function isRepo() {
  return run("git rev-parse --is-inside-work-tree") === "true";
}

export function lastModifiedISO(filePath) {
  if (!isRepo()) return "";
  const out = run(`git log -1 --pretty=format:%cI -- "${filePath}"`);
  return out || "";
}

export function lastCommitHash(filePath) {
  if (!isRepo()) return "";
  const out = run(`git log -1 --pretty=format:%H -- "${filePath}"`);
  return out || "";
}

export function commitList({ since = "", paths = [] } = {}) {
  if (!isRepo()) return [];
  const sinceArg = since ? `--since="${since}"` : "";
  const pathArg = paths.length ? ` -- ${paths.map(p => `"${p}"`).join(" ")}` : "";
  const format = `%H%x09%cI%x09%an%x09%s`;
  const raw = run(`git log --date=iso-strict ${sinceArg} --pretty=format:"${format}"${pathArg}`);
  if (!raw) return [];
  return raw.split("\n").filter(Boolean).map(line => {
    const [hash, iso, author, subject] = line.split("\t");
    return { hash, iso, author, subject };
  });
}

export function filesChanged(hash) {
  if (!isRepo() || !hash) return [];
  const raw = run(`git diff-tree --no-commit-id --name-only -r ${hash}`);
  return raw ? raw.split("\n").filter(Boolean) : [];
}
