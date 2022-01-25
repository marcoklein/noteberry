import { version } from "./version.gen";

export function writeVersionToHtml() {
  const versionEl = document.getElementById("version");
  if (versionEl) {
    versionEl.textContent = version;
  }
}
