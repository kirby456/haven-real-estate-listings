const STORAGE_KEY = "haven-listings-v1";

const starterListings = [
  {
    id: "willow-crest",
    address: "1428 Willow Creek Lane",
    neighborhood: "Silver Lake, Los Angeles",
    price: 1249000,
    beds: 4,
    baths: 3,
    sqft: 2410,
    status: "Active",
    updated: "2h ago",
    photos: 18,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=85",
    saved: true
  },
  {
    id: "canyon-view",
    address: "86 Canyon View Drive",
    neighborhood: "Eagle Rock, Los Angeles",
    price: 875000,
    beds: 3,
    baths: 2,
    sqft: 1780,
    status: "Active",
    updated: "5h ago",
    photos: 12,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=85",
    saved: false
  },
  {
    id: "palm-court",
    address: "204 Palm Court",
    neighborhood: "Pasadena, California",
    price: 1595000,
    beds: 4,
    baths: 3.5,
    sqft: 2860,
    status: "Pending",
    updated: "Yesterday",
    photos: 24,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    saved: false
  },
  {
    id: "marina-boulevard",
    address: "519 Marina Boulevard, #8",
    neighborhood: "Marina del Rey, California",
    price: 749000,
    beds: 2,
    baths: 2,
    sqft: 1320,
    status: "Active",
    updated: "Yesterday",
    photos: 15,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    saved: false
  },
  {
    id: "oakwood-avenue",
    address: "301 Oakwood Avenue",
    neighborhood: "Burbank, California",
    price: 1095000,
    beds: 3,
    baths: 2,
    sqft: 1965,
    status: "Sold",
    updated: "Oct 24",
    photos: 21,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
    saved: false
  },
  {
    id: "gardenia-place",
    address: "77 Gardenia Place",
    neighborhood: "Altadena, California",
    price: 935000,
    beds: 3,
    baths: 2.5,
    sqft: 2100,
    status: "Active",
    updated: "Oct 22",
    photos: 16,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85",
    saved: true
  }
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85"
];

const grid = document.querySelector("#listing-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const emptyState = document.querySelector("#empty-state");
const detailDialog = document.querySelector("#detail-dialog");
const formDialog = document.querySelector("#form-dialog");
const profileDialog = document.querySelector("#profile-dialog");
const toast = document.querySelector("#toast");
let activeFilter = "all";
let deferredInstallPrompt = null;
let toastTimeout;

function readListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterListings.map((listing) => ({ ...listing }));
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Saved listings are not a list.");
    return parsed;
  } catch (error) {
    console.error("Could not load saved listings.", error);
    return starterListings.map((listing) => ({ ...listing }));
  }
}

let listings = readListings();

function saveListings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch (error) {
    console.error("Could not save listings on this device.", error);
    showToast("Couldn’t save. Check your device storage settings.");
    return false;
  }
  return true;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function statusClass(status) {
  return status.toLowerCase();
}

function specIcon(kind) {
  if (kind === "bed") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16v-8m14 8v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2m4-2V6h6v3m-10 4h14"/></svg>';
  }
  return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8V5a2 2 0 1 1 4 0v3m-6 0h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V8Zm4 8-1 2m9-2 1 2"/></svg>';
}

function listingMatches(listing) {
  const search = searchInput.value.trim().toLowerCase();
  const matchesSearch = !search || `${listing.address} ${listing.neighborhood}`.toLowerCase().includes(search);
  const matchesStatus = activeFilter === "all" ||
    (activeFilter === "Saved" ? listing.saved : listing.status === activeFilter);
  return matchesSearch && matchesStatus;
}

function getVisibleListings() {
  const result = listings.filter(listingMatches);
  if (sortSelect.value === "price-desc") return result.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "price-asc") return result.sort((a, b) => a.price - b.price);
  return result;
}

function renderCard(listing) {
  const safeId = escapeHtml(listing.id);
  const favoriteLabel = listing.saved ? "Remove from saved" : "Save listing";
  const image = escapeHtml(listing.image || fallbackImages[0]);
  return `
    <article class="listing-card" data-listing-id="${safeId}" tabindex="0" aria-label="${escapeHtml(listing.address)}, ${formatPrice(listing.price)}">
      <div class="card-photo-wrap">
        <img class="card-photo" src="${image}" alt="Home at ${escapeHtml(listing.address)}" loading="lazy">
        <span class="status-badge ${statusClass(listing.status)}">${escapeHtml(listing.status)}</span>
        <button class="favorite-button${listing.saved ? " is-favorite" : ""}" type="button" data-favorite-id="${safeId}" aria-label="${favoriteLabel}" aria-pressed="${Boolean(listing.saved)}">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17s-7-4.2-7-9.4a3.8 3.8 0 0 1 7-2.2 3.8 3.8 0 0 1 7 2.2C17 12.8 10 17 10 17Z"/></svg>
        </button>
        <span class="photo-count"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="6" cy="7" r="1.2"/><path d="m3 11 3-2.5 2 1.5 2.5-3L13 10"/></svg>${Number(listing.photos) || 1}</span>
      </div>
      <div class="card-content">
        <p class="card-price">${formatPrice(listing.price)}</p>
        <p class="card-address">${escapeHtml(listing.address)}</p>
        <p class="card-neighborhood">${escapeHtml(listing.neighborhood)}</p>
        <div class="card-divider"></div>
        <div class="card-meta">
          <div class="card-specs">
            <span class="card-spec">${specIcon("bed")}${escapeHtml(listing.beds)} bd</span>
            <span class="card-spec">${specIcon("bath")}${escapeHtml(listing.baths)} ba</span>
            ${listing.sqft ? `<span class="card-spec">${Number(listing.sqft).toLocaleString()} sqft</span>` : ""}
          </div>
          <span class="card-updated">${escapeHtml(listing.updated || "Just added")}</span>
        </div>
      </div>
    </article>`;
}

function render() {
  const visibleListings = getVisibleListings();
  grid.innerHTML = visibleListings.map(renderCard).join("");
  emptyState.hidden = visibleListings.length > 0;
  document.querySelector("#visible-count").textContent = String(visibleListings.length);
  document.querySelector("#all-filter-count").textContent = String(listings.length);

  const activeCount = listings.filter((listing) => listing.status === "Active").length;
  const portfolioValue = listings.reduce((sum, listing) => sum + (Number(listing.price) || 0), 0);
  document.querySelector("#total-count").textContent = String(listings.length).padStart(2, "0");
  document.querySelector("#active-count").textContent = String(activeCount).padStart(2, "0");
  document.querySelector("#portfolio-value").textContent = portfolioValue >= 1000000
    ? `$${(portfolioValue / 1000000).toFixed(2)}m`
    : formatPrice(portfolioValue);
  document.querySelector("#active-note").textContent = `${listings.length} in your portfolio`;
  document.querySelector("#profile-listing-count").textContent = String(listings.length);
  document.querySelector("#profile-saved-count").textContent = String(listings.filter((listing) => listing.saved).length);

  const subtitle = activeFilter === "Saved" ? "The homes you’ve bookmarked." :
    activeFilter === "all" ? "A little overview of what’s yours." : `${activeFilter} listings in your portfolio.`;
  document.querySelector("#section-subtitle").textContent = subtitle;
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function openDetails(id) {
  const listing = listings.find((item) => item.id === id);
  if (!listing) return;
  document.querySelector("#detail-content").innerHTML = `
    <img class="detail-photo" src="${escapeHtml(listing.image || fallbackImages[0])}" alt="Home at ${escapeHtml(listing.address)}">
    <div class="detail-body">
      <span class="status-badge detail-status ${statusClass(listing.status)}">${escapeHtml(listing.status)}</span>
      <p class="detail-price">${formatPrice(listing.price)}</p>
      <p class="detail-address">${escapeHtml(listing.address)}</p>
      <p class="detail-neighborhood">${escapeHtml(listing.neighborhood)}</p>
      <div class="detail-specs">
        <span>${specIcon("bed")}${escapeHtml(listing.beds)} bedrooms</span>
        <span>${specIcon("bath")}${escapeHtml(listing.baths)} bathrooms</span>
        ${listing.sqft ? `<span>${Number(listing.sqft).toLocaleString()} sqft</span>` : ""}
      </div>
      <div class="detail-footer"><span>${Number(listing.photos) || 1} photos · Updated ${escapeHtml(listing.updated || "just now")}</span>
      <button class="secondary-button" type="button" data-detail-favorite="${escapeHtml(listing.id)}">${listing.saved ? "♥  Saved" : "♡  Save listing"}</button></div>
    </div>`;
  detailDialog.showModal();
}

function updateFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.filter === filter);
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    const current = (filter === "all" && button.dataset.nav === "listings") ||
      (filter === "Saved" && button.dataset.nav === "saved");
    button.classList.toggle("is-current", current);
    if (current) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  render();
}

function toggleFavorite(id) {
  const listing = listings.find((item) => item.id === id);
  if (!listing) return;
  listing.saved = !listing.saved;
  if (!saveListings()) {
    listing.saved = !listing.saved;
    return;
  }
  render();
  if (detailDialog.open) openDetails(id);
  showToast(listing.saved ? "Added to your saved listings" : "Removed from saved listings");
}

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => updateFilter(button.dataset.filter));
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.nav === "profile") {
      profileDialog.showModal();
      return;
    }
    updateFilter(button.dataset.nav === "saved" ? "Saved" : "all");
    document.querySelector("#listing-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);
document.querySelector("#clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  updateFilter("all");
});
document.querySelector("#add-listing-button").addEventListener("click", () => formDialog.showModal());
document.querySelector("#profile-button").addEventListener("click", () => profileDialog.showModal());

grid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite-id]");
  if (favoriteButton) {
    event.stopPropagation();
    toggleFavorite(favoriteButton.dataset.favoriteId);
    return;
  }
  const card = event.target.closest("[data-listing-id]");
  if (card) openDetails(card.dataset.listingId);
});

grid.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-listing-id]")) {
    event.preventDefault();
    openDetails(event.target.dataset.listingId);
  }
});

document.querySelector("#detail-content").addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-favorite]");
  if (button) toggleFavorite(button.dataset.detailFavorite);
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

[detailDialog, formDialog, profileDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelector("#listing-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const price = Number(formData.get("price"));
  if (!Number.isFinite(price) || price <= 0) {
    showToast("Enter a valid asking price.");
    return;
  }
  const listing = {
    id: `listing-${Date.now()}`,
    address: String(formData.get("address")).trim(),
    neighborhood: String(formData.get("neighborhood")).trim(),
    price,
    beds: Number(formData.get("beds")),
    baths: Number(formData.get("baths")),
    status: String(formData.get("status")),
    updated: "Just now",
    photos: 1,
    image: fallbackImages[listings.length % fallbackImages.length],
    saved: false
  };
  listings.unshift(listing);
  if (!saveListings()) {
    listings.shift();
    return;
  }
  event.currentTarget.reset();
  formDialog.close();
  searchInput.value = "";
  sortSelect.value = "recent";
  updateFilter("all");
  showToast("Listing added to your portfolio");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") {
    [detailDialog, formDialog, profileDialog].forEach((dialog) => {
      if (dialog.open) dialog.close();
    });
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelector("#install-button").hidden = false;
});

document.querySelector("#install-button").addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    showToast("Use your browser menu to add Haven to your home screen.");
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

window.addEventListener("appinstalled", () => {
  document.querySelector("#install-button").hidden = true;
  showToast("Haven is ready on your home screen");
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Could not register the offline app worker.", error);
    });
  });
}

render();
