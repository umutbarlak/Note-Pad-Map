import { setStorage, getStorage, icons, userIcon } from "./helpers.js";

const form = document.querySelector("form");
const noteList = document.querySelector("ul");
const wrapper = document.querySelector(".wrapper");
const toggle = document.querySelector(".toggle");
const aside = document.querySelector("aside");

//! global değişkenler
let coords;
let notes = getStorage() || [];
let markerLayer = [];
let map;

//haritayı ekrana bas
function loadMap(coords) {
  map = L.map("map").setView(coords, 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);

  L.marker(coords, { icon: userIcon }).addTo(map);

  renderNoteList(notes);

  toggleModal();

  //haritadaki tıklanma olayında izle
  map.on("click", onMapClick);
}

navigator.geolocation.getCurrentPosition(
  //KONUM ALINIRSA
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude]);
  },

  //KONUM ALAMAZSA

  () => {
    loadMap([39.931206, 32.859045]);
  }
);

//haritadaki tıklanma olayında çalışır
function onMapClick(e) {
  coords = [e.latlng.lat, e.latlng.lng];

  //   form göster
  form.style.display = "flex";

  //  ilk inputa focusla
  form[0].focus();
}

form[3].addEventListener("click", () => {
  form.style.display = "none";
  form.reset();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newNote = {
    id: new Date().getTime(),
    title: form[0].value,
    date: form[1].value,
    status: form[2].value,
    coords: coords,
  };
  // dizinin başına notu ekle
  notes.unshift(newNote);
  //notları listele
  renderNoteList(notes);
  //localstorage güncelle
  setStorage(notes);
  //form u kapat
});

function renderNoteList(items) {
  noteList.innerHTML = "";
  markerLayer.clearLayers();
  items.forEach((note) => {
    const listEle = document.createElement("li");

    listEle.dataset.id = note.id;

    listEle.innerHTML = `<div class="info">
      <p>${note.title}</p>
      <p>
        <span>Tarih:</span>
        <span>${note.date}</span>
      </p>
      <p>
        <span>Durum:</span>
        <span>${note.status}</span>
      </p>
    </div>
    <div class="icons">
      <i id="fly" class="bi bi-airplane-fill"></i>
      <i id="delete" class="bi bi-trash3-fill"></i>
    </div>`;

    noteList.appendChild(listEle);

    renderMarker(note);
  });

  form.style.display = "none";
  form.reset();
}

function renderMarker(note) {
  L.marker(note.coords, { icon: icons[note.status] })
    .addTo(markerLayer)
    .bindPopup(note.title);
}

toggle.addEventListener("click", toggleModal);

function toggleModal() {
  form.classList.toggle("active");
  noteList.classList.toggle("active");
  wrapper.classList.toggle("active");
  aside.classList.toggle("active");
}

noteList.addEventListener("click", (e) => {
  const found_id = e.target.closest("li").dataset.id;
  if (
    e.target.id === "delete" &&
    confirm("Silmek istediğinize emin misiniz?")
  ) {
    notes = notes.filter((note) => note.id != found_id);

    setStorage(notes);

    renderNoteList(notes);
  }
  if (e.target.id === "fly") {
    const note = notes.find((note) => note.id == found_id);
    if (innerWidth <= 500) {
      toggleModal();
    }
    map.flyTo(note.coords);
  }
});

console.log(window);
