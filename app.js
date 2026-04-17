// State
let currentSection = 'contents';
let showEnglish = false;
let showIndonesian = false;
let xmlData = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadXMLData();
    
    // Load preferences
    const savedEn = localStorage.getItem('showEnglish');
    const savedId = localStorage.getItem('showIndonesian');
    if (savedEn === 'true') toggleEnglish();
    if (savedId === 'true') toggleIndonesian();
});

// Load XML Data
async function loadXMLData() {
    try {
        const response = await fetch('database.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        xmlData = parser.parseFromString(xmlText, 'text/xml');
        
        renderDrawer();
        renderAllContent();
    } catch (error) {
        console.error('Error loading database.xml:', error);
        document.getElementById('main-container').innerHTML = 
            '<p class="text-red-500 p-4">Gagal memuat database. Pastikan file database.xml tersedia.</p>';
    }
}

// Drawer Functions
function openDrawer() {
    document.getElementById('sidebar-drawer').classList.add('active');
    document.getElementById('drawer-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    document.getElementById('sidebar-drawer').classList.remove('active');
    document.getElementById('drawer-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleDrawer() {
    const drawer = document.getElementById('sidebar-drawer');
    if (drawer.classList.contains('active')) {
        closeDrawer();
    } else {
        openDrawer();
    }
}

function toggleSubmenu(babId) {
    const submenu = document.getElementById(`submenu-${babId}`);
    const icon = document.getElementById(`expand-icon-${babId}`);
    if (submenu.classList.contains('expanded')) {
        submenu.classList.remove('expanded');
        icon.classList.remove('expanded');
        icon.textContent = '▶';
    } else {
        submenu.classList.add('expanded');
        icon.classList.add('expanded');
        icon.textContent = '▼';
    }
}

// Translation Functions
function toggleEnglish() {
    showEnglish = !showEnglish;
    const btn = document.getElementById('translate-en-btn');
    const text = btn.querySelector('.translate-text');
    
    if (showEnglish) {
        btn.classList.add('en-active');
        text.textContent = 'ON';
    } else {
        btn.classList.remove('en-active');
        text.textContent = 'EN';
    }
    
    document.querySelectorAll('.translation-en').forEach(el => {
        el.classList.toggle('visible', showEnglish);
    });
    
    localStorage.setItem('showEnglish', showEnglish);
}

function toggleIndonesian() {
    showIndonesian = !showIndonesian;
    const btn = document.getElementById('translate-id-btn');
    const text = btn.querySelector('.translate-text');
    
    if (showIndonesian) {
        btn.classList.add('id-active');
        text.textContent = 'ON';
    } else {
        btn.classList.remove('id-active');
        text.textContent = 'ID';
    }
    
    document.querySelectorAll('.translation-id').forEach(el => {
        el.classList.toggle('visible', showIndonesian);
    });
    
    localStorage.setItem('showIndonesian', showIndonesian);
}

// Parse XML Data
function parseXMLData() {
    if (!xmlData) return { pengantar: [], bab: [], bagianAkhir: [] };
    
    const data = { pengantar: [], bab: [], bagianAkhir: [] };
    
    // Parse pengantar
    const pengantarItems = xmlData.querySelectorAll('pengantar > item');
    pengantarItems.forEach(item => {
        data.pengantar.push({
            id: item.getAttribute('id'),
            page: item.getAttribute('halaman'),
            title: item.querySelector('judul_jp')?.textContent || '',
            titleEn: item.querySelector('judul_en')?.textContent || '',
            titleId: item.querySelector('judul_id')?.textContent || ''
        });
    });
    
    // Parse bab
    const babElements = xmlData.querySelectorAll('daftar_isi > bab');
    babElements.forEach(bab => {
        const grammarPoints = [];
        const points = bab.querySelectorAll('grammar_points > point');
        points.forEach(point => {
            grammarPoints.push({
                id: point.getAttribute('id'),
                page: point.getAttribute('halaman'),
                text: point.textContent
            });
        });
        
        data.bab.push({
            id: bab.getAttribute('id'),
            page: bab.getAttribute('halaman'),
            category: bab.querySelector('kategori')?.textContent || '',
            categoryEn: bab.querySelector('kategori_en')?.textContent || '',
            categoryId: bab.querySelector('kategori_id')?.textContent || '',
            number: bab.querySelector('nomor')?.textContent || '',
            title: bab.querySelector('judul_jp')?.textContent || '',
            titleEn: bab.querySelector('judul_en')?.textContent || '',
            titleId: bab.querySelector('judul_id')?.textContent || '',
            grammarPoints: grammarPoints,
            matomePage: bab.querySelector('matome')?.getAttribute('halaman') || null
        });
    });
    
    // Parse bagian akhir
    const bagianAkhir = xmlData.querySelector('bagian_akhir');
    if (bagianAkhir) {
        const items = bagianAkhir.querySelectorAll('item');
        items.forEach(item => {
            data.bagianAkhir.push({
                id: item.getAttribute('id'),
                page: item.getAttribute('halaman'),
                title: item.querySelector('judul_jp')?.textContent || '',
                titleEn: item.querySelector('judul_en')?.textContent || '',
                titleId: item.querySelector('judul_id')?.textContent || ''
            });
        });
    }
    
    return data;
}

// Render Functions
function renderDrawer() {
    const data = parseXMLData();
    const container = document.getElementById('drawer-content');
    
    let html = '<div class="drawer-section"><div class="drawer-section-title">Pengantar</div><div class="drawer-list">';
    
    data.pengantar.forEach(item => {
        html += `
            <div class="drawer-item" onclick="showSection('contents'); closeDrawer();">
                <div class="drawer-item-info" style="margin-left: 0;">
                    <span class="drawer-item-title">${item.title}</span>
                    <span class="drawer-item-sub">p.${item.page}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div></div><div class="drawer-section"><div class="drawer-section-title">Daftar Isi (Bab 1-22)</div><div class="drawer-list">';
    
    let currentCategory = '';
    data.bab.forEach((bab) => {
        if (bab.category !== currentCategory) {
            currentCategory = bab.category;
            html += `<div style="padding: 0.5rem 1rem; font-size: 0.75rem; color: #be123c; font-weight: 600; margin-top: 0.5rem;">${currentCategory}</div>`;
        }
        
        html += `
            <div class="drawer-bab-group">
                <div class="drawer-item-expandable" onclick="toggleSubmenu(${bab.id})">
                    <div class="drawer-item-number">${bab.number}</div>
                    <div class="drawer-item-info">
                        <span class="drawer-item-title">${bab.title}</span>
                        <span class="drawer-item-sub">${bab.category} · p.${bab.page}</span>
                    </div>
                    <span class="drawer-expand-icon" id="expand-icon-${bab.id}">▶</span>
                </div>
                <div class="drawer-submenu" id="submenu-${bab.id}">
                    <div class="drawer-submenu-item" onclick="showSection('bab-${bab.id}-header'); closeDrawer();">
                        <span class="drawer-submenu-text">📖 Header Bab</span>
                    </div>
                    <div class="drawer-submenu-item" onclick="showSection('bab-${bab.id}-grammar'); closeDrawer();">
                        <span class="drawer-submenu-text">📝 Grammar Points (${bab.grammarPoints.length})</span>
                    </div>
                    ${bab.matomePage ? `
                    <div class="drawer-submenu-item" onclick="alert('Matome Bab ${bab.number} - Halaman ${bab.matomePage}'); closeDrawer();">
                        <span class="drawer-submenu-text">✅ Matome (p.${bab.matomePage})</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div></div><div class="drawer-section"><div class="drawer-section-title">Bagian Akhir</div><div class="drawer-list">';
    
    data.bagianAkhir.forEach(item => {
        html += `
            <div class="drawer-item" onclick="showSection('contents'); closeDrawer();">
                <div class="drawer-item-info" style="margin-left: 0;">
                    <span class="drawer-item-title">${item.title}</span>
                    <span class="drawer-item-sub">p.${item.page}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

function renderAllContent() {
    const container = document.getElementById('main-container');
    let html = renderContentsSection();
    
    const data = parseXMLData();
    data.bab.forEach(bab => {
        html += renderBabHeader(bab);
        html += renderBabGrammar(bab);
    });
    
    container.innerHTML = html;
}

function renderContentsSection() {
    const data = parseXMLData();
    
    let html = `
        <section id="contents">
            <div class="home-header">
                <h1 class="home-title">TRY! N2</h1>
                <p class="home-subtitle">文法から伸ばす日本語</p>
                <p class="translation-en">Learning Japanese from Grammar</p>
                <p class="translation-id">Belajar Bahasa Jepang dari Tata Bahasa</p>
                <p class="home-desc">改訂版 | JLPT Preparation</p>
                <p class="translation-id">Edisi Revisi | Persiapan Ujian JLPT</p>
            </div>
            
            <div class="quick-access">
                <h2 class="quick-access-title">
                    <span class="sentence-jp">もくじ</span> 
                    <span class="translation-en">Table of Contents</span>
                    <span class="translation-id">Daftar Isi</span>
                </h2>
    `;
    
    html += '<div class="quick-section-title">Pengantar</div>';
    data.pengantar.forEach(item => {
        html += `
            <div class="quick-item" onclick="showSection('contents')">
                <span class="quick-item-title"><span class="sentence-jp">${item.title}</span></span>
                <span class="translation-en">${item.titleEn}</span>
                <span class="translation-id">${item.titleId}</span>
                <span class="quick-item-page">p.${item.page}</span>
            </div>
        `;
    });
    
    html += '<div class="quick-section-title">Bab 1-22</div>';
    data.bab.forEach(bab => {
        html += `
            <div class="bab-card-home" onclick="showSection('bab-${bab.id}-header')">
                <div class="bab-number-home">${bab.number}</div>
                <div class="bab-info-home">
                    <div class="bab-category-home">
                        <span class="sentence-jp">${bab.category}</span>
                        <span class="translation-en">${bab.categoryEn}</span>
                        <span class="translation-id">${bab.categoryId}</span>
                    </div>
                    <div class="bab-title-home">
                        <span class="sentence-jp">${bab.title}</span>
                        <span class="translation-en">${bab.titleEn}</span>
                        <span class="translation-id">${bab.titleId}</span>
                    </div>
                </div>
                <span class="bab-page-home">p.${bab.page}</span>
            </div>
        `;
    });
    
    html += '</div></section>';
    return html;
}

function renderBabHeader(bab) {
    // Get content from XML
    const contentData = getBabContent(bab.id);
    
    let html = `
        <section id="bab-${bab.id}-header" class="hidden">
            <div class="section-header">
                <div class="bab-header-category">
                    <span class="sentence-jp">${bab.category}</span>
                    <span class="translation-en">${bab.categoryEn}</span>
                    <span class="translation-id">${bab.categoryId}</span>
                </div>
                <div class="bab-header-title">
                    <span class="bab-header-number">${bab.number}</span>
                    <h1 class="bab-header-text"><span class="sentence-jp">${bab.title}</span></h1>
                    <span class="bab-header-en">${bab.titleEn}</span>
                    <span class="translation-id">${bab.titleId}</span>
                </div>
            </div>
    `;
    
    // Dekiru box
    if (contentData.dekiru && contentData.dekiru.length > 0) {
        html += `
            <div class="dekiru-box">
                <h3 class="dekiru-title">
                    <span class="sentence-jp">できること</span>
                    <span class="translation-en">Dekiru Koto</span>
                    <span class="translation-id">Dapat Melakukan</span>
                </h3>
                <ul>
        `;
        contentData.dekiru.forEach(item => {
            html += `
                <li class="dekiru-item">
                    <span class="dekiru-bullet">●</span>
                    <div>
                        <p><span class="sentence-jp">${item.jp}</span></p>
                        <span class="translation-en">${item.en}</span>
                        <span class="translation-id">${item.id}</span>
                    </div>
                </li>
            `;
        });
        html += '</ul></div>';
    }
    
    // Render content based on type
    if (contentData.contentType === 'job_ad') {
        html += renderJobAd(contentData.content);
    } else if (contentData.contentType === 'speech') {
        html += renderSpeech(contentData.content);
    } else if (contentData.contentType === 'essay') {
        html += renderEssay(contentData.content);
    } else if (contentData.contentType === 'article') {
        html += renderArticle(contentData.content);
    } else if (contentData.contentType === 'conversation') {
        html += renderConversation(contentData.content);
    } else if (contentData.contentType === 'story') {
        html += renderStory(contentData.content);
    } else if (contentData.contentType === 'editorial') {
        html += renderEditorial(contentData.content);
    }
    
    html += `<p class="page-number">p.${bab.page}</p></section>`;
    return html;
}

function renderBabGrammar(bab) {
    const contentData = getBabContent(bab.id);
    
    let html = `<section id="bab-${bab.id}-grammar" class="hidden space-y-6">`;
    
    // Header Grammar
    html += `
        <div class="section-header">
            <div class="bab-header-category">Grammar Points</div>
            <div class="bab-header-title">
                <span class="bab-header-number">${bab.number}</span>
                <h1 class="bab-header-text">${bab.title}</h1>
            </div>
        </div>
    `;
    
    // Render each grammar point
    if (contentData.grammar) {
        contentData.grammar.forEach((g, idx) => {
            html += `
                <article class="grammar-article" id="grammar-${bab.id}-${idx}">
                    <div class="grammar-header">
                        <h2 class="grammar-title">${g.num} ${g.title}</h2>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            ${g.plus ? '<span class="plus-badge">+Plus</span>' : ''}
                            <span class="star">${'★'.repeat(g.stars)}</span>
                        </div>
                    </div>
                    <div class="grammar-content">
                        
                        <!-- Dou Tsukau Section -->
                        <div class="dou-tsukau">
                            <h3 class="dou-tsukau-title">
                                どう使う？
                                <span class="translation-en">How to use?</span>
                                <span class="translation-id">Bagaimana Menggunakannya?</span>
                            </h3>
                            <p class="dou-tsukau-text">
                                <span class="sentence-jp">${g.desc}</span>
                            </p>
                            <span class="translation-en">${g.descEn}</span>
                            <span class="translation-id">${g.descId}</span>
                        </div>
                        
                        <!-- Pattern Section -->
                        <div class="grammar-pattern">
                            <p class="grammar-pattern-text">
                                <span class="sentence-jp">${g.pattern}</span>
                            </p>
                            <span class="translation-id">${g.patternId}</span>
                        </div>
                        
                        <!-- Example List - STRUKTUR BARU -->
                        <div class="example-list">
            `;
            
            // Examples dengan sentence-jp wrapper
            g.examples.forEach((ex, exIdx) => {
                html += `
                            <div class="example-item">
                                <p>
                                    <span class="example-num">${String.fromCharCode(9312 + exIdx)}</span> 
                                    <span class="sentence-jp">${ex.jp}</span>
                                </p>
                                ${ex.id ? `<span class="translation-id">${ex.id}</span>` : ''}
                            </div>
                `;
            });
            
            html += `
                        </div>
            `;
            
            // Yatte Miyou section if exists
            if (g.yatteMiyou) {
                html += renderYatteMiyou(g.yatteMiyou);
            }
            
            // Plus section if exists
            if (g.plus) {
                html += `
                    <div class="plus-section">
                        <div class="plus-header">
                            <span class="plus-badge">+Plus</span>
                            <span class="plus-title">${g.plus}</span>
                        </div>
                    </div>
                `;
            }
            
            // Page reference
            html += `
                        <p class="page-ref">p.${g.page}</p>
                    </div>
                </article>
            `;
        });
    }
    
    // Check section if exists
    if (contentData.check) {
        html += renderCheck(contentData.check);
    }
    
    html += '</section>';
    return html;
}

// Helper function for Yatte Miyou section
function renderYatteMiyou(yatteMiyou) {
    let html = `
        <div class="yatte-miyou">
            <h3 class="yatte-miyou-title">
                やってみよう！
                <span class="yatte-miyou-ref">${yatteMiyou.ref}</span>
            </h3>
            <div class="quiz-grid">
    `;
    
    if (yatteMiyou.soal) {
        yatteMiyou.soal.forEach(soal => {
            html += `
                <div class="quiz-item">
                    <p>
                        <span class="sentence-jp">${soal.teks}</span>
                    </p>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        </div>
    `;
    return html;
}

// Content Type Renderers

function renderJobAd(jobAd) {
    let html = `
        <div class="job-ad">
            <div class="job-ad-title">
                <h2><span class="sentence-jp">${jobAd.title}</span></h2>
                <span class="translation-en">${jobAd.titleEn}</span>
                <span class="translation-id">${jobAd.titleId}</span>
            </div>
            <p class="job-ad-subtitle">
                <span class="highlight">${jobAd.highlight}</span><span class="sentence-jp">${jobAd.subtitle}</span>
                <span class="translation-en">${jobAd.subtitleEn}</span>
                <span class="translation-id">${jobAd.subtitleId}</span>
            </p>
            <div style="margin-top: 1rem;">
    `;
    
    jobAd.sections.forEach(section => {
        html += `
            <div class="job-section">
                <span class="job-section-label">
                    <span class="sentence-jp">${section.label}</span>▶
                    <span class="translation-en">${section.labelEn}▶</span>
                    <span class="translation-id">${section.labelId}▶</span>
                </span>
                <div class="job-section-content">
                    <p>${section.content}</p>
                    ${section.note ? `<p class="job-note">${section.note}</p>` : ''}
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="job-contact">
                <p style="font-weight: 700;">${jobAd.contact.name}</p>
                <p>☎ ${jobAd.contact.tel}</p>
                <p>${jobAd.contact.web}</p>
                <p>E-mail ${jobAd.contact.email}</p>
            </div>
        </div>
    `;
    return html;
}

function renderSpeech(speechData) {
    let html = '<div class="speech-box">';
    
    if (speechData.type === 'simple') {
        // Simple speech with teks and teks_id
        html += `<p><span class="sentence-jp">${highlightGrammar(speechData.teks)}</span></p>`;
        if (speechData.teksId) {
            html += `<span class="translation-id">${speechData.teksId}</span>`;
        }
    } else if (speechData.type === 'dialogue') {
        // Speech with karakter/dialogue
        speechData.characters.forEach(char => {
            html += `
                <div class="speech-character">
                    <span class="character-name">${char.nama}</span>
                    <p class="character-jp"><span class="sentence-jp">${char.jp}</span></p>
                    ${char.id ? `<span class="translation-id">${char.id}</span>` : ''}
                </div>
            `;
        });
    }
    
    html += '</div>';
    return html;
}

function renderEssay(essayData) {
    let html = '<div class="essay-box">';
    
    essayData.paragraphs.forEach((para, idx) => {
        html += `
            <p class="essay-paragraph">
                <span class="sentence-jp">${highlightGrammar(para.jp)}</span>
                ${para.id ? `<span class="translation-id">${para.id}</span>` : ''}
            </p>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderArticle(articleData) {
    let html = '<div class="article-box">';
    
    articleData.paragraphs.forEach((para, idx) => {
        html += `
            <p class="article-paragraph">
                <span class="sentence-jp">${highlightGrammar(para.jp)}</span>
                ${para.id ? `<span class="translation-id">${para.id}</span>` : ''}
            </p>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderConversation(convData) {
    let html = '<div class="conversation-box">';
    
    convData.dialogs.forEach((dialog, idx) => {
        html += `
            <div class="dialog-item">
                <span class="dialog-speaker">${dialog.speaker}</span>
                <p class="dialog-jp"><span class="sentence-jp">${dialog.jp}</span></p>
                ${dialog.id ? `<span class="translation-id">${dialog.id}</span>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderStory(storyData) {
    let html = '<div class="story-box">';
    
    storyData.paragraphs.forEach((para, idx) => {
        html += `
            <p class="story-paragraph">
                <span class="sentence-jp">${highlightGrammar(para.jp)}</span>
                ${para.id ? `<span class="translation-id">${para.id}</span>` : ''}
            </p>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderEditorial(editorialData) {
    let html = '<div class="editorial-box">';
    
    editorialData.paragraphs.forEach((para, idx) => {
        html += `
            <p class="editorial-paragraph">
                <span class="sentence-jp">${highlightGrammar(para.jp)}</span>
                ${para.id ? `<span class="translation-id">${para.id}</span>` : ''}
            </p>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderCheck(check) {
    let html = `
        <div class="check-box" style="margin-top: 2rem;">
            <div class="check-header">
                <span class="check-icon">📖</span>
                <h2 class="check-title">Check</h2>
                <span class="check-ref">▶答え 別冊P. ${check.page}</span>
            </div>
            <div class="check-grid">
                <div>
    `;
    
    check.questions.forEach(q => {
        html += `
            <p class="check-question">
                ${q.num}）<span class="sentence-jp">${q.text}</span>
                ${q.en ? `<span class="translation-en">${q.en}</span>` : ''}
                ${q.id ? `<span class="translation-id">${q.id}</span>` : ''}
        `</p>;
    });
    
    html += `
                    <div class="check-options">
                        ${check.options.map(o => `<span>${o}</span>`).join('')}
                    </div>
                </div>
                <div>
    `;
    
    check.questions2.forEach(q => {
        html += `
            <p class="check-question">
                ${q.num}）<span class="sentence-jp">${q.text}</span>
                ${q.en ? `<span class="translation-en">${q.en}</span>` : ''}
                ${q.id ? `<span class="translation-id">${q.id}</span>` : ''}
        `</p>;
    });
    
    html += `
                    <div class="check-options">
                        ${check.options2.map(o => `<span>${o}</span>`).join('')}
                    </div>
                </div>
            </div>
            <p class="page-number">p.${check.page}</p>
        </div>
    `;
    
    return html;
}

function highlightGrammar(text) {
    const patterns = [
        '入社して以来', 'において', '部長をはじめ', '先輩方のご指導のもとで',
        '仕事の進め方はもとより', '人は失敗から学ぶものだ', '仕事をする上で', '残念ながら'
    ];
    
    let result = text;
    patterns.forEach(pattern => {
        result = result.replace(new RegExp(pattern, 'g'), `<span class="highlight-text">${pattern}</span>`);
    });
    
    return result;
}

// Get content from XML for specific bab
function getBabContent(babId) {
    if (!xmlData) return {};
    
    const content = xmlData.querySelector(`bab${babId}_content`);
    if (!content) return {};
    
    const result = {
        dekiru: [],
        grammar: [],
        check: null,
        contentType: null,
        content: null
    };
    
    // Parse dekiru
    const dekiruItems = content.querySelectorAll('dekiru_koto > item');
    dekiruItems.forEach(item => {
        result.dekiru.push({
            jp: item.querySelector('jp')?.textContent || '',
            en: item.querySelector('en')?.textContent || '',
            id: item.querySelector('id')?.textContent || ''
        });
    });
    
    // Parse content based on type
    const contentEl = content.querySelector('content');
    if (contentEl) {
        const type = contentEl.getAttribute('type');
        result.contentType = type;
        
        switch(type) {
            case 'job_ad':
                result.content = parseJobAd(contentEl);
                break;
            case 'speech':
                result.content = parseSpeech(contentEl);
                break;
            case 'essay':
                result.content = parseEssay(contentEl);
                break;
            case 'article':
                result.content = parseArticle(contentEl);
                break;
            case 'conversation':
                result.content = parseConversation(contentEl);
                break;
            case 'story':
                result.content = parseStory(contentEl);
                break;
            case 'editorial':
                result.content = parseEditorial(contentEl);
                break;
        }
    }
    
    // Parse grammar points
    const subBabs = content.querySelectorAll('sub_bab');
    subBabs.forEach((subBab, idx) => {
        const grammar = {
            num: subBab.querySelector('nomor')?.textContent || (idx + 1),
            page: subBab.getAttribute('halaman'),
            title: subBab.querySelector('judul')?.textContent || '',
            stars: (subBab.querySelector('bintang')?.textContent || '').length,
            pattern: subBab.querySelector('pola')?.textContent || '',
            patternId: subBab.querySelector('pola_id')?.textContent || '',
            desc: subBab.querySelector('dou_tsukau > penjelasan > jp')?.textContent || '',
            descEn: subBab.querySelector('dou_tsukau > penjelasan > en')?.textContent || '',
            descId: subBab.querySelector('dou_tsukau > penjelasan > id')?.textContent || '',
            plus: subBab.querySelector('plus')?.textContent || null,
            examples: []
        };
        
        const examples = subBab.querySelectorAll('contoh > item');
        examples.forEach(ex => {
            grammar.examples.push({
                jp: ex.querySelector('jp')?.textContent || '',
                id: ex.querySelector('id')?.textContent || ''
            });
        });
        
        result.grammar.push(grammar);
    });
    
    // Parse check
    const check = content.querySelector('check');
    if (check) {
        result.check = parseCheck(check);
    }
    
    return result;
}

// Content Parsers

function parseJobAd(jobAdEl) {
    const sections = [];
    const sectionElements = jobAdEl.querySelectorAll('section');
    
    sectionElements.forEach(sec => {
        const type = sec.getAttribute('type');
        sections.push({
            label: type,
            labelEn: getLabelEn(type),
            labelId: getLabelId(type),
            content: sec.querySelector('isi')?.textContent || '',
            note: sec.querySelector('catatan')?.textContent || ''
        });
    });
    
    return {
        title: jobAdEl.querySelector('judul')?.textContent || '',
        titleEn: jobAdEl.querySelector('judul_en')?.textContent || '',
        titleId: jobAdEl.querySelector('judul_id')?.textContent || '',
        highlight: jobAdEl.querySelector('subjudul > highlight')?.textContent || '',
        subtitle: jobAdEl.querySelector('subjudul')?.childNodes[2]?.textContent || '',
        subtitleEn: jobAdEl.querySelector('subjudul_en')?.textContent || '',
        subtitleId: jobAdEl.querySelector('subjudul_id')?.textContent || '',
        sections: sections,
        contact: {
            name: jobAdEl.querySelector('kontak > nama')?.textContent || '',
            tel: jobAdEl.querySelector('kontak > tel')?.textContent || '',
            web: jobAdEl.querySelector('kontak > web')?.textContent || '',
            email: jobAdEl.querySelector('kontak > email')?.textContent || ''
        }
    };
}

function parseSpeech(speechEl) {
    // Check if it has karakter elements (dialogue format)
    const karakterElements = speechEl.querySelectorAll('karakter');
    
    if (karakterElements.length > 0) {
        // Dialogue format with characters
        const characters = [];
        karakterElements.forEach(char => {
            characters.push({
                nama: char.getAttribute('nama') || '',
                jp: char.querySelector('jp')?.textContent || '',
                id: char.querySelector('id')?.textContent || ''
            });
        });
        return {
            type: 'dialogue',
            characters: characters
        };
    } else {
        // Simple format with teks
        return {
            type: 'simple',
            teks: speechEl.querySelector('teks')?.textContent || '',
            teksId: speechEl.querySelector('teks_id')?.textContent || ''
        };
    }
}

function parseEssay(essayEl) {
    const paragraphs = [];
    
    // Try to find paragraph elements
    const paraElements = essayEl.querySelectorAll('paragraph');
    
    if (paraElements.length > 0) {
        paraElements.forEach(para => {
            paragraphs.push({
                jp: para.querySelector('jp')?.textContent || '',
                id: para.querySelector('id')?.textContent || ''
            });
        });
    } else {
        // Fallback: treat entire content as one paragraph
        paragraphs.push({
            jp: essayEl.textContent || '',
            id: ''
        });
    }
    
    return { paragraphs };
}

function parseArticle(articleEl) {
    const paragraphs = [];
    
    const paraElements = articleEl.querySelectorAll('paragraph');
    
    if (paraElements.length > 0) {
        paraElements.forEach(para => {
            paragraphs.push({
                jp: para.querySelector('jp')?.textContent || '',
                id: para.querySelector('id')?.textContent || ''
            });
        });
    } else {
        paragraphs.push({
            jp: articleEl.textContent || '',
            id: ''
        });
    }
    
    return { paragraphs };
}

function parseConversation(convEl) {
    const dialogs = [];
    
    const dialogElements = convEl.querySelectorAll('dialog');
    
    if (dialogElements.length > 0) {
        dialogElements.forEach(dialog => {
            dialogs.push({
                speaker: dialog.querySelector('speaker')?.textContent || '',
                jp: dialog.querySelector('jp')?.textContent || '',
                id: dialog.querySelector('id')?.textContent || ''
            });
        });
    } else {
        // Fallback: try karakter format (backward compatibility)
        const karakterElements = convEl.querySelectorAll('karakter');
        karakterElements.forEach(char => {
            dialogs.push({
                speaker: char.getAttribute('nama') || '',
                jp: char.querySelector('jp')?.textContent || '',
                id: char.querySelector('id')?.textContent || ''
            });
        });
    }
    
    return { dialogs };
}

function parseStory(storyEl) {
    const paragraphs = [];
    
    const paraElements = storyEl.querySelectorAll('paragraph');
    
    if (paraElements.length > 0) {
        paraElements.forEach(para => {
            paragraphs.push({
                jp: para.querySelector('jp')?.textContent || '',
                id: para.querySelector('id')?.textContent || ''
            });
        });
    } else {
        paragraphs.push({
            jp: storyEl.textContent || '',
            id: ''
        });
    }
    
    return { paragraphs };
}

function parseEditorial(editorialEl) {
    const paragraphs = [];
    
    const paraElements = editorialEl.querySelectorAll('paragraph');
    
    if (paraElements.length > 0) {
        paraElements.forEach(para => {
            paragraphs.push({
                jp: para.querySelector('jp')?.textContent || '',
                id: para.querySelector('id')?.textContent || ''
            });
        });
    } else {
        paragraphs.push({
            jp: editorialEl.textContent || '',
            id: ''
        });
    }
    
    return { paragraphs };
}

function parseCheck(check) {
    const result = {
        page: check.getAttribute('halaman'),
        questions: [],
        options: [],
        questions2: [],
        options2: []
    };
    
    const bagian1 = check.querySelector('bagian1');
    if (bagian1) {
        const soalElements = bagian1.querySelectorAll('soal');
        soalElements.forEach(soal => {
            result.questions.push({
                num: soal.getAttribute('id'),
                text: soal.querySelector('teks')?.textContent || '',
                en: soal.querySelector('teks_en')?.textContent || ''
            });
        });
        
        const pilihanElements = bagian1.querySelectorAll('pilihan_bagian1 > item');
        pilihanElements.forEach(p => {
            result.options.push(p.textContent);
        });
    }
    
    const bagian2 = check.querySelector('bagian2');
    if (bagian2) {
        const soalElements = bagian2.querySelectorAll('soal');
        soalElements.forEach(soal => {
            result.questions2.push({
                num: soal.getAttribute('id'),
                text: soal.querySelector('teks')?.textContent || '',
                en: soal.querySelector('teks_en')?.textContent || ''
            });
        });
        
        const pilihanElements = bagian2.querySelectorAll('pilihan_bagian2 > item');
        pilihanElements.forEach(p => {
            result.options2.push(p.textContent);
        });
    }
    
    return result;
}

function getLabelEn(type) {
    const labels = {
        '仕事': 'Work',
        '資格': 'Requirements',
        '給与': 'Salary',
        '交通費': 'Transportation',
        '応募': 'Application'
    };
    return labels[type] || type;
}

function getLabelId(type) {
    const labels = {
        '仕事': 'Pekerjaan',
        '資格': 'Kualifikasi',
        '給与': 'Gaji',
        '交通費': 'Transportasi',
        '応募': 'Cara Melamar'
    };
    return labels[type] || type;
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        currentSection = sectionId;
        
        const navTitle = document.getElementById('current-section-title');
        if (sectionId === 'contents') {
            navTitle.textContent = 'TRY! N2';
        } else {
            const match = sectionId.match(/bab-(\d+)-/);
            if (match) {
                const babId = parseInt(match[1]);
                const data = parseXMLData();
                const bab = data.bab.find(b => b.id == babId);
                if (bab) navTitle.textContent = `Bab ${bab.number}`;
            }
        }
        
        window.scrollTo(0, 0);
    }
}

function speakJapanese(text) {
    if (!('speechSynthesis' in window)) return;
    
    // Hentikan suara yang sedang berjalan
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, '').trim());
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
}

function attachTTS() {
    document.querySelectorAll('.sentence-jp').forEach(el => {
        if (el.dataset.ttsAttached) return;
        el.dataset.ttsAttached = 'true';
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
            if (e.target.closest('a')) return;
            speakJapanese(this.textContent);
        });
    });
}

setTimeout(attachTTS, 1000);
