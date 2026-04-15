fetch('data.xml')
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(xml => {

    // Ambil semua sub bab
    const subBabs = xml.getElementsByTagName("sub_bab");

    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    let menuHTML = "";
    let contentHTML = "";

    for (let i = 0; i < subBabs.length; i++) {
        const judul = subBabs[i].getElementsByTagName("judul")[0].textContent;
        const id = subBabs[i].getAttribute("id");

        // Sidebar
        menuHTML += `<li onclick="showBab('${id}')">${judul}</li>`;

        // Content
        contentHTML += `
            <div class="bab" id="bab-${id}" style="display:none;">
                <h2>${judul}</h2>
            </div>
        `;
    }

    sidebar.innerHTML = `<ul>${menuHTML}</ul>`;
    content.innerHTML = contentHTML;
});

// show function
function showBab(id) {
    document.querySelectorAll('.bab').forEach(el => el.style.display = 'none');
    document.getElementById(`bab-${id}`).style.display = 'block';
}