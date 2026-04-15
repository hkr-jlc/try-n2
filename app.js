// ==========================
// LOAD XML (AMAN UNTUK GITHUB)
// ==========================
fetch('./database.xml')
  .then(res => {
    if (!res.ok) throw new Error("XML tidak ditemukan!");
    return res.text();
  })
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(xml => {

    console.log("XML Loaded ✅");

    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    const babList = xml.getElementsByTagName("bab");

    let menuHTML = "";
    let contentHTML = "";

    // ==========================
    // LOOP SEMUA BAB
    // ==========================
    for (let i = 0; i < babList.length; i++) {

      const bab = babList[i];
      const id = bab.getAttribute("id");

      const judulJP = getText(bab, "judul_jp");
      const judulEN = getText(bab, "judul_en");
      const judulID = getText(bab, "judul_id");

      // ==========================
      // SIDEBAR MENU
      // ==========================
      menuHTML += `
        <div class="drawer-item" onclick="showBab('${id}')">
          <div class="drawer-item-number">${id}</div>
          <div class="drawer-item-info">
            <span class="drawer-item-title">${judulJP}</span>
            <span class="drawer-item-sub">${judulID || ""}</span>
          </div>
        </div>
      `;

      // ==========================
      // CONTENT HEADER
      // ==========================
      contentHTML += `
        <div class="bab-content" id="bab-${id}" style="display:none;">
          <div class="section-header">
            <div class="bab-header-title">
              <span class="bab-header-number">${id}</span>
              <span class="bab-header-text">${judulJP}</span>
            </div>
            <div class="bab-header-en">${judulEN || ""}</div>
          </div>
      `;

      // ==========================
      // AUTO DETECT CONTENT (DINAMIS 🔥)
      // ==========================
      let subBabList = [];

      const contentTag = `bab${id}_content`;
      const contentNode = xml.getElementsByTagName(contentTag)[0];

      if (contentNode) {
        subBabList = contentNode.getElementsByTagName("sub_bab");
      } else {
        console.warn(`❌ BAB ${id} tidak punya content (${contentTag})`);
      }

      // ==========================
      // LOOP SUB BAB
      // ==========================
      for (let j = 0; j < subBabList.length; j++) {

        const sub = subBabList[j];

        const nomor = getText(sub, "nomor");
        const judul = getText(sub, "judul");

        contentHTML += `
          <div class="grammar-article">
            <div class="grammar-header">
              <div class="grammar-title">${nomor}. ${judul}</div>
            </div>

            <div class="grammar-content">
        `;

        // ==========================
        // PENJELASAN
        // ==========================
        const dou = sub.getElementsByTagName("dou_tsukau")[0];

        if (dou) {
          const penjelasan = getText(dou, "jp");
          const pola = getText(dou, "pola");

          contentHTML += `
            <div class="dou-tsukau">
              <div class="dou-tsukau-title">どう使う？</div>
              <div class="dou-tsukau-text">${penjelasan}</div>
            </div>

            <div class="grammar-pattern">
              <div class="grammar-pattern-text">${pola}</div>
            </div>
          `;
        }

        // ==========================
        // CONTOH
        // ==========================
        const contohList = sub.getElementsByTagName("contoh");

        if (contohList.length > 0) {
          const items = contohList[0].getElementsByTagName("item");

          contentHTML += `<div class="example-list">`;

          for (let k = 0; k < items.length; k++) {
            const jp = getText(items[k], "jp");
            const idt = getText(items[k], "id");

            contentHTML += `
              <div class="example-item">
                ${jp}
                <div class="translation-id">${idt || ""}</div>
              </div>
            `;
          }

          contentHTML += `</div>`;
        }

        contentHTML += `
            </div>
          </div>
        `;
      }

      contentHTML += `</div>`;
    }

    // ==========================
    // RENDER
    // ==========================
    sidebar.innerHTML = `
      <div class="drawer-section">
        <div class="drawer-section-title">DAFTAR BAB</div>
        <div class="drawer-list">
          ${menuHTML}
        </div>
      </div>
    `;

    content.innerHTML = contentHTML;

    // tampilkan bab pertama otomatis
    if (babList.length > 0) {
      showBab(babList[0].getAttribute("id"));
    }

  })
  .catch(err => {
    console.error("❌ ERROR:", err);
    document.getElementById("content").innerHTML =
      "<h2 style='color:red'>Gagal load XML ❌</h2>";
  });


// ==========================
// FUNCTION SHOW BAB
// ==========================
function showBab(id) {
  document.querySelectorAll('.bab-content').forEach(el => {
    el.style.display = 'none';
  });

  const target = document.getElementById(`bab-${id}`);
  if (target) target.style.display = 'block';
}


// ==========================
// HELPER
// ==========================
function getText(parent, tag) {
  const el = parent.getElementsByTagName(tag)[0];
  return el ? el.textContent.trim() : "";
}
