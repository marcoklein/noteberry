export function writeNotificationToHtml(text: string) {
  const container = document.getElementById("notifications");
  if (!container) {
    console.error("Could not find notifications container.");
    return;
  }
  const notificationEl = document.createElement("div");
  notificationEl.textContent = text;
  container.prepend(notificationEl);
}
