// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  loadXML();
});


// ==========================
// LOAD XML
// ==========================
function loadXML() {
  fetch("./database.xml")
    .then(res => {
      if (!res.ok) throw new Error("XML tidak ditemukan");
      return res.text();
    })
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(xml => {
      console.log("XML Loaded ✅");

      renderSidebar(xml);
      renderBab(xml, "1");
      initUI(xml);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("content-container").innerHTML =
        "<h2 style='color:red'>Gagal load XML</h2>";
    });
}


// ==========================
// SIDEBAR
// ==========================
function renderSidebar(xml) {
  const sidebar = document.getElementById("sidebar");
  const babList = xml.getElementsByTagName("bab");

  let html = `
    <div class="drawer-section">
      <div class="drawer-section-title">DAFTAR BAB</div>
      <div class="drawer-list">
  `;

  for (let i = 0; i < babList.length; i++) {
    const bab = babList[i];
    const id = bab.getAttribute("id");

    const jp = getText(bab, "judul_jp");
    const idn = getText(bab, "judul_id");

    html += `
      <div class="drawer-item" onclick="showBab('${id}')">
        <div class="drawer-item-number">${id}</div>
        <div class="drawer-item-info">
          <div class="drawer-item-title">${jp}</div>
          <div class="drawer-item-sub">${idn}</div>
        </div>
      </div>
    `;
  }

  html += `</div></div>`;
  sidebar.innerHTML = html;
}


// ==========================
// RENDER BAB
// ==========================
function renderBab(xml, id) {
  const container = document.getElementById("content-container");

  const babNode = xml.querySelector(`bab[id="${id}"]`);

  const titleJP = getText(babNode, "judul_jp");
  const titleEN = getText(babNode, "judul_en");
  const titleID = getText(babNode, "judul_id");

  let html = `
    <div class="section-header">
      <div class="bab-header-title">
        <span class="bab-header-number">${id}</span>
        <span class="bab-header-text">${titleJP}</span>
      </div>
      <div class="bab-header-en">${titleEN}</div>
      <div class="translation-id">${titleID}</div>
    </div>
  `;

  // ==========================
  // AMBIL SUB BAB DINAMIS
  // ==========================
  const contentTag = `bab${id}_content`;
  const contentNode = xml.getElementsByTagName(contentTag)[0];

  if (!contentNode) {
    html += `<p>Konten belum tersedia</p>`;
    container.innerHTML = html;
    return;
  }

  const subBabList = contentNode.getElementsByTagName("sub_bab");

  for (let i = 0; i < subBabList.length; i++) {
    const sub = subBabList[i];

    const nomor = getText(sub, "nomor");
    const judul = getText(sub, "judul");

    html += `
      <div class="grammar-article">
        <div class="grammar-header">
          <div class="grammar-title">${nomor}. ${judul}</div>
        </div>

        <div class="grammar-content">
    `;

    // ==========================
    // DOU TSUKAU
    // ==========================
    const dou = sub.getElementsByTagName("dou_tsukau")[0];

    if (dou) {
      html += `
        <div class="dou-tsukau">
          <div class="dou-tsukau-title">どう使う？</div>
          <div class="dou-tsukau-text">${getText(dou, "jp")}</div>
          <div class="translation-id">${getText(dou, "id")}</div>
        </div>

        <div class="grammar-pattern">
          <div class="grammar-pattern-text">${getText(dou, "pola")}</div>
        </div>
      `;
    }

    // ==========================
    // CONTOH
    // ==========================
    const contohList = sub.getElementsByTagName("contoh");

    if (contohList.length > 0) {
      const items = contohList[0].getElementsByTagName("item");

      html += `<div class="example-list">`;

      for (let j = 0; j < items.length; j++) {
        html += `
          <div class="example-item">
            ${getText(items[j], "jp")}
            <div class="translation-id">${getText(items[j], "id")}</div>
          </div>
        `;
      }

      html += `</div>`;
    }

    html += `</div></div>`;
  }

  container.innerHTML = html;
}


// ==========================
// NAVIGASI
// ==========================
function showBab(id) {
  window.currentXML && renderBab(window.currentXML, id);
  closeDrawer();
}


// ==========================
// UI
// ==========================
function initUI(xml) {
  window.currentXML = xml;

  const drawer = document.getElementById("sidebar-drawer");
  const overlay = document.getElementById("drawer-overlay");

  document.getElementById("hamburger-btn").onclick = () => {
    drawer.classList.add("active");
    overlay.classList.add("active");
  };

  document.getElementById("drawer-close").onclick = closeDrawer;
  overlay.onclick = closeDrawer;

  document.getElementById("translate-id-btn").onclick = () => toggleLang("id");
  document.getElementById("translate-en-btn").onclick = () => toggleLang("en");
}

function closeDrawer() {
  document.getElementById("sidebar-drawer").classList.remove("active");
  document.getElementById("drawer-overlay").classList.remove("active");
}


// ==========================
// TRANSLATE
// ==========================
function toggleLang(lang) {
  document.querySelectorAll(".translation-en, .translation-id")
    .forEach(el => el.classList.remove("visible"));

  document.querySelectorAll(`.translation-${lang}`)
    .forEach(el => el.classList.add("visible"));
}


// ==========================
// HELPER
// ==========================
function getText(parent, tag) {
  if (!parent) return "";
  const el = parent.getElementsByTagName(tag)[0];
  return el ? el.textContent.trim() : "";
}
