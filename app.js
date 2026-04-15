// ==========================
// LOAD XML
// ==========================
fetch('database.xml')
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(xml => {

    console.log("XML Loaded");

    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    // ==========================
    // AMBIL DATA BAB (DAFTAR ISI)
    // ==========================
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
        const kategori = getText(bab, "kategori");

        // ==========================
        // SIDEBAR
        // ==========================
        menuHTML += `
            <li class="menu-item" onclick="showBab('${id}')">
                <strong>BAB ${id}</strong><br>
                ${judulJP}<br>
                <small>${judulID || ""}</small>
            </li>
        `;

        // ==========================
        // CONTENT HEADER
        // ==========================
        contentHTML += `
            <div class="bab-content" id="bab-${id}" style="display:none;">
                <h1>BAB ${id}</h1>
                <h2>${judulJP}</h2>
                <p>${judulEN || ""}</p>
                <p>${judulID || ""}</p>
                <hr>
        `;

        // ==========================
        // AMBIL SUB BAB SESUAI KONTEN
        // ==========================
        let subBabList = [];

        if (id === "1") {
            subBabList = xml.getElementsByTagName("bab1_content")[0]?.getElementsByTagName("sub_bab") || [];
        } 
        else if (id === "2") {
            subBabList = xml.getElementsByTagName("bab2_content")[0]?.getElementsByTagName("sub_bab") || [];
        } 
        else {
            subBabList = []; // nanti bisa dikembangkan bab3+
        }

        // ==========================
        // LOOP SUB BAB
        // ==========================
        for (let j = 0; j < subBabList.length; j++) {

            const sub = subBabList[j];

            const nomor = getText(sub, "nomor");
            const judul = getText(sub, "judul");

            contentHTML += `
                <div class="subbab">
                    <h3>${nomor}. ${judul}</h3>
            `;

            // ==========================
            // PENJELASAN
            // ==========================
            const dou = sub.getElementsByTagName("dou_tsukau")[0];

            if (dou) {
                const penjelasan = getText(dou, "jp");
                const pola = getText(dou, "pola");

                contentHTML += `
                    <p><b>Penjelasan:</b> ${penjelasan}</p>
                    <p><b>Pola:</b> ${pola}</p>
                `;
            }

            // ==========================
            // CONTOH
            // ==========================
            const contohList = sub.getElementsByTagName("contoh");

            if (contohList.length > 0) {
                const items = contohList[0].getElementsByTagName("item");

                contentHTML += `<ul>`;

                for (let k = 0; k < items.length; k++) {
                    const jp = getText(items[k], "jp");
                    const idt = getText(items[k], "id");

                    contentHTML += `<li>${jp}<br><small>${idt || ""}</small></li>`;
                }

                contentHTML += `</ul>`;
            }

            contentHTML += `</div>`;
        }

        contentHTML += `</div>`;
    }

    // ==========================
    // RENDER KE HTML
    // ==========================
    sidebar.innerHTML = `<ul>${menuHTML}</ul>`;
    content.innerHTML = contentHTML;

  })
  .catch(err => {
    console.error("ERROR LOAD XML:", err);
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
// HELPER FUNCTION
// ==========================
function getText(parent, tag) {
    const el = parent.getElementsByTagName(tag)[0];
    return el ? el.textContent : "";
}
