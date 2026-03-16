const form = document.querySelector<HTMLFormElement>("#config-form");

const entries = await fetch("/api/entries").then((res) => res.json());

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  console.info("Config payload", payload);
  alert("Config captured in browser console. Wire this to a Nitro route to persist it.");
});
