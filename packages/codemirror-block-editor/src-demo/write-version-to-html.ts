import { version } from "../src/version.gen";

export function writeVersionToHtml() {
  const versionEl = document.getElementById("version");
  if (versionEl) {
    versionEl.textContent = version;
  }
}
