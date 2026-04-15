// State
let currentSection = 'contents';
let showEnglish = false;
let showIndonesian = false;
let xmlData = null;
let isSpeaking = false;
let currentUtterance = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadXMLData();
    
    // Load preferences
    const savedEn = localStorage.getItem('showEnglish');
    const savedId = localStorage.getItem('showIndonesian');
    if (savedEn === 'true') toggleEnglish();
    if (savedId === 'true') toggleIndonesian();
	
    // Initialize speech synthesis
    initSpeechSynthesis();
});

// Initialize Speech Synthesis
function initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
        console.warn('Web Speech API not supported');
        return;
    }
    loadJapaneseVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadJapaneseVoice;
    }
}

let japaneseVoice = null;

function loadJapaneseVoice() {
    const voices = speechSynthesis.getVoices();
    japaneseVoice = voices.find(voice => 
        voice.lang.startsWith('ja') || 
        voice.name.includes('Japanese') ||
        voice.name.includes('日本')
    );
}

// Text-to-Speech Function
function speakJapanese(text, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (!('speechSynthesis' in window)) {
        alert('Text-to-speech tidak didukung di browser ini');
        return;
    }
    
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        if (isSpeaking && currentUtterance && currentUtterance.text === text) {
            isSpeaking = false;
            currentUtterance = null;
            updateSpeakingIndicator(null);
            return;
        }
    }
    
    const cleanText = text.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    if (japaneseVoice) utterance.voice = japaneseVoice;
    
    utterance.onstart = function() {
        isSpeaking = true;
        currentUtterance = utterance;
        updateSpeakingIndicator(event ? event.target : null);
    };
    
    utterance.onend = function() {
        isSpeaking = false;
        currentUtterance = null;
        updateSpeakingIndicator(null);
    };
    
    utterance.onerror = function(event) {
        console.error('Speech error:', event.error);
        isSpeaking = false;
        currentUtterance = null;
        updateSpeakingIndicator(null);
    };
    
    speechSynthesis.speak(utterance);
}

function updateSpeakingIndicator(element) {
    document.querySelectorAll('.speaking-indicator').forEach(el => {
        el.classList.remove('speaking-indicator');
    });
    if (element) element.classList.add('speaking-indicator');
}

function wrapJapaneseText(element) {
    if (!element) return;
    if (element.closest('a, button, .no-tts')) return;
    
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.parentElement.closest('a, button, .tts-text, .no-tts')) continue;
        if (!node.textContent.trim()) continue;
        if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(node.textContent)) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        const span = document.createElement('span');
        span.className = 'tts-text';
        span.textContent = textNode.textContent;
        span.onclick = function(e) {
            e.stopPropagation();
            speakJapanese(this.textContent, e);
        };
        textNode.parentNode.replaceChild(span, textNode);
    });
}

function applyTTSToContainer(container) {
    if (!container) return;
    const elements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
    
    elements.forEach(el => {
        if (el.classList.contains('tts-processed')) return;
        if (el.closest('a, button')) return;
        if (el.classList.contains('translation-en') || el.classList.contains('translation-id')) return;
        
        el.classList.add('tts-processed');
        wrapJapaneseText(el);
    });
}

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
                    もくじ 
                    <span class="translation-en">Table of Contents</span>
                    <span class="translation-id">Daftar Isi</span>
                </h2>
    `;
    
    html += '<div class="quick-section-title">Pengantar</div>';
    data.pengantar.forEach(item => {
        html += `
            <div class="quick-item" onclick="showSection('contents')">
                <span class="quick-item-title">${item.title}</span>
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
                        ${bab.category}
                        <span class="translation-en">${bab.categoryEn}</span>
                        <span class="translation-id">${bab.categoryId}</span>
                    </div>
                    <div class="bab-title-home">
                        ${bab.title}
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
                    ${bab.category}
                    <span class="translation-en">${bab.categoryEn}</span>
                    <span class="translation-id">${bab.categoryId}</span>
                </div>
                <div class="bab-header-title">
                    <span class="bab-header-number">${bab.number}</span>
                    <h1 class="bab-header-text">${bab.title}</h1>
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
                    できること
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
                        <p>${item.jp}</p>
                        <span class="translation-en">${item.en}</span>
                        <span class="translation-id">${item.id}</span>
                    </div>
                </li>
            `;
        });
        html += '</ul></div>';
    }
    
    // Job Ad or Speech
    if (contentData.jobAd) {
        html += renderJobAd(contentData.jobAd);
    } else if (contentData.speech) {
        html += `
            <div class="speech-box">
                <p>${highlightGrammar(contentData.speech)}</p>
                <span class="translation-en">${contentData.speechEn || ''}</span>
                <span class="translation-id">${contentData.speechId || ''}</span>
            </div>
        `;
    }
    
    html += `<p class="page-number">p.${bab.page}</p></section>`;
    return html;
}

function renderBabGrammar(bab) {
    const contentData = getBabContent(bab.id);
    
    let html = `<section id="bab-${bab.id}-grammar" class="hidden space-y-6">`;
    
    html += `
        <div class="section-header">
            <div class="bab-header-category">Grammar Points</div>
            <div class="bab-header-title">
                <span class="bab-header-number">${bab.number}</span>
                <h1 class="bab-header-text">${bab.title}</h1>
            </div>
        </div>
    `;
    
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
                        <div class="dou-tsukau">
                            <h3 class="dou-tsukau-title">
                                どう使う？
                                <span class="translation-en">How to use?</span>
                                <span class="translation-id">Bagaimana Menggunakannya?</span>
                            </h3>
                            <p class="dou-tsukau-text">${g.desc}</p>
                            <span class="translation-en">${g.descEn}</span>
                            <span class="translation-id">${g.descId}</span>
                        </div>
                        
                        <div class="grammar-pattern">
                            <p class="grammar-pattern-text">${g.pattern}</p>
                            <span class="translation-id">${g.patternId}</span>
                        </div>
                        
                        <div class="example-list">
            `;
            
            g.examples.forEach((ex, exIdx) => {
                html += `
                    <p class="example-item">
                        <span style="font-weight: 700;">${String.fromCharCode(9312 + exIdx)}</span> ${ex.jp}
                        <span class="translation-id">${ex.id}</span>
                    </p>
                `;
            });
            
            html += `
                        </div>
                        <p class="page-ref">p.${g.page}</p>
                    </div>
                </article>
            `;
        });
    }
    
    // Check section
    if (contentData.check) {
        html += renderCheck(contentData.check);
    }
    
    html += '</section>';
    return html;
}

function renderJobAd(jobAd) {
    let html = `
        <div class="job-ad">
            <div class="job-ad-title">
                <h2>${jobAd.title}</h2>
                <span class="translation-en">${jobAd.titleEn}</span>
                <span class="translation-id">${jobAd.titleId}</span>
            </div>
            <p class="job-ad-subtitle">
                <span class="highlight">${jobAd.highlight}</span>${jobAd.subtitle}
                <span class="translation-en">${jobAd.subtitleEn}</span>
                <span class="translation-id">${jobAd.subtitleId}</span>
            </p>
            <div style="margin-top: 1rem;">
    `;
    
    jobAd.sections.forEach(section => {
        html += `
            <div class="job-section">
                <span class="job-section-label">
                    ${section.label}▶
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
                ${q.num}）${q.text}
                <span class="translation-en">${q.en}</span>
            </p>
        `;
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
                ${q.num}）${q.text}
                <span class="translation-en">${q.en}</span>
            </p>
        `;
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
        check: null
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
    
    // Parse job ad or speech
    const jobAd = content.querySelector('job_ad');
    if (jobAd) {
        result.jobAd = parseJobAd(jobAd);
    }
    
    const speech = content.querySelector('speech > teks');
    if (speech) {
        result.speech = speech.textContent;
        result.speechEn = content.querySelector('speech > teks_en')?.textContent || '';
        result.speechId = content.querySelector('speech > teks_id')?.textContent || '';
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

function parseJobAd(jobAd) {
    return {
        title: jobAd.querySelector('judul')?.textContent || '',
        titleEn: jobAd.querySelector('judul_en')?.textContent || '',
        titleId: jobAd.querySelector('judul_id')?.textContent || '',
        highlight: jobAd.querySelector('subjudul > highlight')?.textContent || '',
        subtitle: jobAd.querySelector('subjudul')?.childNodes[2]?.textContent || '',
        subtitleEn: jobAd.querySelector('subjudul_en')?.textContent || '',
        subtitleId: jobAd.querySelector('subjudul_id')?.textContent || '',
        sections: parseJobSections(jobAd),
        contact: {
            name: jobAd.querySelector('kontak > nama')?.textContent || '',
            tel: jobAd.querySelector('kontak > tel')?.textContent || '',
            web: jobAd.querySelector('kontak > web')?.textContent || '',
            email: jobAd.querySelector('kontak > email')?.textContent || ''
        }
    };
}

function parseJobSections(jobAd) {
    const sections = [];
    const sectionElements = jobAd.querySelectorAll('section');
    
    sectionElements.forEach(sec => {
        const type = sec.getAttribute('type');
        const sectionData = {
            label: type,
            labelEn: getLabelEn(type),
            labelId: getLabelId(type),
            content: sec.querySelector('isi')?.textContent || '',
            note: sec.querySelector('catatan')?.textContent || ''
        };
        sections.push(sectionData);
    });
    
    return sections;
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
