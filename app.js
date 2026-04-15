// Global variables
let xmlData = null;
let currentSection = 'contents';
let currentBab = null;
let currentGrammarPoint = null; // Grammar point yang sedang aktif
let showEnglish = false; // Toggle untuk terjemahan English
let showIndonesian = false; // Toggle untuk terjemahan Indonesia

// ===== DRAWER FUNCTIONS =====
function openDrawer() {
	console.log('Opening drawer...');
	const drawer = document.getElementById('sidebar-drawer');
	const overlay = document.getElementById('drawer-overlay');
	
	if (drawer && overlay) {
		drawer.classList.add('active');
		overlay.classList.add('active');
		document.body.style.overflow = 'hidden';
		console.log('Drawer opened');
	} else {
		console.error('Drawer elements not found!');
	}
}

function closeDrawer() {
	console.log('Closing drawer...');
	const drawer = document.getElementById('sidebar-drawer');
	const overlay = document.getElementById('drawer-overlay');
	
	if (drawer && overlay) {
		drawer.classList.remove('active');
		overlay.classList.remove('active');
		document.body.style.overflow = '';
		console.log('Drawer closed');
	}
}

function toggleDrawer() {
	console.log('toggleDrawer called');
	const drawer = document.getElementById('sidebar-drawer');
	const overlay = document.getElementById('drawer-overlay');
	
	if (!drawer || !overlay) {
		console.error('Drawer or overlay element not found!');
		return;
	}
	
	if (drawer.classList.contains('active')) {
		console.log('Closing drawer');
		closeDrawer();
	} else {
		console.log('Opening drawer');
		openDrawer();
	}
}

// ===== LOAD DATABASE =====
async function loadDatabase() {
	try {
		const response = await fetch('database.xml');
		const xmlText = await response.text();
		const parser = new DOMParser();
		xmlData = parser.parseFromString(xmlText, 'text/xml');
		renderHomePage();
		renderDrawerMenu();
	} catch (error) {
		console.error('Error loading database.xml:', error);
		document.getElementById('bab-container').innerHTML = 
			'<p class="text-red-500 p-4">Gagal memuat database. Pastikan file database.xml tersedia.</p>';
	}
}

// ===== RENDER HOME PAGE =====
function renderHomePage() {
	if (!xmlData) return;

	const babContainer = document.getElementById('bab-container');
	const indexContainer = document.getElementById('index-container');
	
	// Render Bab-bab untuk Home Page
	const babElements = xmlData.querySelectorAll('daftar_isi > bab');
	let babHTML = '';

	babElements.forEach((bab) => {
		const id = bab.getAttribute('id') || '';
		const nomor = bab.querySelector('nomor')?.textContent || '';
		const judul = bab.querySelector('judul_jp')?.textContent || '';
		const judulEn = bab.querySelector('judul_en')?.textContent || '';
		const judulId = bab.querySelector('judul_id')?.textContent || '';
		const kategori = bab.querySelector('kategori')?.textContent || '';
		const kategoriEn = bab.querySelector('kategori_en')?.textContent || '';
		const kategoriId = bab.querySelector('kategori_id')?.textContent || '';
		const halaman = bab.getAttribute('halaman') || '';
		
		// Tentukan section target berdasarkan nomor bab
		let sectionTarget = '';
		if (nomor === '1') sectionTarget = 'bab1-header';
		else if (nomor === '2') sectionTarget = 'bab2-header';
		
		// Render Bab Card untuk Home Page
		babHTML += `
			<div class="bab-card-home" onclick="showSection('${sectionTarget}', ${nomor})">
				<div class="bab-number-home">${nomor}</div>
				<div class="bab-info-home">
					<div class="bab-category-home">${kategori}<br><span class="translation-en">${kategoriEn || ''}</span><span class="translation-id">${kategoriId || ''}</span></div>
					<div class="bab-title-home">${judul}<br><span class="translation-en">${judulEn || ''}</span><span class="translation-id">${judulId || ''}</span></div>
				</div>
				<span class="bab-page-home">p.${halaman}</span>
			</div>
		`;
	});

	babContainer.innerHTML = babHTML;

	// Render Bagian Akhir (Index & Supplement)
	const bagianAkhir = xmlData.querySelector('bagian_akhir');
	if (bagianAkhir) {
		const items = bagianAkhir.querySelectorAll('item');
		let indexHTML = '';
		
		items.forEach((item) => {
			const judul = item.querySelector('judul_jp')?.textContent || '';
			const judulEn = item.querySelector('judul_en')?.textContent || '';
			const judulId = item.querySelector('judul_id')?.textContent || '';
			const halaman = item.getAttribute('halaman') || '';
			
			indexHTML += `
				<div class="quick-item">
					<span class="quick-item-title">${judul}</span>
					<span class="translation-en">${judulEn}</span>
					<span class="translation-id">${judulId}</span>
					<span class="quick-item-page">p.${halaman}</span>
				</div>
			`;
		});

		// Supplement
		const supplement = bagianAkhir.querySelector('supplement');
		if (supplement) {
			const supJudul = supplement.querySelector('judul_jp')?.textContent || '';
			const supJudulEn = supplement.querySelector('judul_en')?.textContent || '';
			const supJudulId = supplement.querySelector('judul_id')?.textContent || '';
			const supItem = supplement.querySelector('item');
			if (supItem) {
				const supItemJudul = supItem.querySelector('judul_jp')?.textContent || '';
				indexHTML += `
					<div class="quick-item">
						<span class="quick-item-title">${supJudul}</span>
						<span class="translation-en">${supItemJudul}</span>
						<span class="translation-id">${supJudulId}</span>
						<span class="quick-item-page">別冊</span>
					</div>
				`;
			}
		}

		indexContainer.innerHTML = indexHTML;
	}
}

// ===== RENDER DRAWER MENU =====
function renderDrawerMenu() {
	if (!xmlData) return;

	const drawerBabList = document.getElementById('drawer-bab-list');
	
	// Render Bab List dengan Submenu
	const babElements = xmlData.querySelectorAll('daftar_isi > bab');
	let babDrawerHTML = '';
	let globalPointId = 1;

	babElements.forEach((bab) => {
		const id = bab.getAttribute('id') || '';
		const nomor = bab.querySelector('nomor')?.textContent || '';
		const judul = bab.querySelector('judul_jp')?.textContent || '';
		const judulEn = bab.querySelector('judul_en')?.textContent || '';
		const judulId = bab.querySelector('judul_id')?.textContent || '';
		const kategori = bab.querySelector('kategori')?.textContent || '';
		const kategoriEn = bab.querySelector('kategori_en')?.textContent || '';
		const kategoriId = bab.querySelector('kategori_id')?.textContent || '';
		const halaman = bab.getAttribute('halaman') || '';
		
		// Tentukan section target
		let sectionTarget = '';
		let grammarTarget = '';
		if (nomor === '1') {
			sectionTarget = 'bab1-header';
			grammarTarget = 'grammar-list';
		} else if (nomor === '2') {
			sectionTarget = 'bab2-header';
			grammarTarget = 'bab2-grammar';
		}
		
		// Render Bab Item dengan Expandable Submenu
		babDrawerHTML += `
			<div class="drawer-bab-group" data-bab="${nomor}">
				<div class="drawer-item-expandable" onclick="toggleSubmenu('${nomor}')">
					<div class="drawer-item-number">${nomor}</div>
					<div class="drawer-item-info">
						<span class="drawer-item-title">${judul}<br><span class="translation-en">${judulEn || ''}</span><span class="translation-id">${judulId || ''}</span></span>
						<span class="drawer-item-sub">${kategori} · p.${halaman}<br><span class="translation-en">${kategoriEn || ''}</span><span class="translation-id">${kategoriId || ''}</span></span>
					</div>
					<span class="drawer-expand-icon" id="expand-icon-${nomor}">▶</span>
				</div>
				<div class="drawer-submenu" id="submenu-${nomor}">
					<div class="drawer-submenu-item" onclick="showSection('${sectionTarget}', ${nomor}); closeDrawer();">
						<span class="drawer-submenu-text">📖 本文<br><span class="translation-en">Text</span><span class="translation-id">Teks</span></span>
					</div>
		`;
		
		// Render Grammar Points sebagai Submenu
		const grammarPoints = bab.querySelectorAll('grammar_points > point');
		grammarPoints.forEach((point) => {
			const pointText = point.textContent || '';
			const pointHalaman = point.getAttribute('halaman') || '';
			const plusMatch = pointText.match(/\(\+Plus\s+(.+)\)/);
			let displayText = pointText;
			
			if (plusMatch) {
				displayText = pointText.replace(/\s*\(\+Plus\s+.+\)/, '');
			}
			
			const grammarSubId = `grammar-${globalPointId}`;
			
			babDrawerHTML += `
					<div class="drawer-submenu-item" data-point="${globalPointId}" onclick="showSection('${grammarTarget}', '${grammarSubId}'); closeDrawer();">
						<span class="drawer-submenu-number">${globalPointId}</span>
						<span class="drawer-submenu-text">${displayText}</span>
						<span class="drawer-submenu-page">p.${pointHalaman}</span>
					</div>
			`;
			globalPointId++;
		});
		
		// Tambahkan link ke Matome
		const matome = bab.querySelector('matome');
		if (matome) {
			let matomeSection = '';
			if (nomor === '1') matomeSection = 'matome';
			else if (nomor === '2') matomeSection = 'bab2-matome';
			
			babDrawerHTML += `
					<div class="drawer-submenu-item" onclick="showSection('${matomeSection}'); closeDrawer();">
						<span class="drawer-submenu-text">📝 まとめの問題<br><span class="translation-en">Review Questions</span><span class="translation-id">Soal Latihan</span></span>
					</div>
			`;
		}
		
		babDrawerHTML += `
				</div>
			</div>
		`;
	});
	
	// Tambahkan Index & Supplement
	const bagianAkhir = xmlData.querySelector('bagian_akhir');
	if (bagianAkhir) {
		babDrawerHTML += `
			<div class="drawer-section-divider"></div>
		`;
		
		const items = bagianAkhir.querySelectorAll('item');
		items.forEach((item) => {
			const judul = item.querySelector('judul_jp')?.textContent || '';
			const halaman = item.getAttribute('halaman') || '';
			
			babDrawerHTML += `
				<div class="drawer-item" onclick="showSection('contents'); closeDrawer();">
					<div class="drawer-item-info" style="margin-left: 0;">
						<span class="drawer-item-title">${judul}</span>
						<span class="drawer-item-sub">p.${halaman}</span>
					</div>
				</div>
			`;
		});
	}

	drawerBabList.innerHTML = babDrawerHTML;
}

// ===== TOGGLE SUBMENU =====
function toggleSubmenu(babNumber) {
	const submenu = document.getElementById(`submenu-${babNumber}`);
	const icon = document.getElementById(`expand-icon-${babNumber}`);
	
	if (submenu.classList.contains('expanded')) {
		submenu.classList.remove('expanded');
		icon.classList.remove('expanded');
		icon.textContent = '▶';
	} else {
		// Close all other submenus
		document.querySelectorAll('.drawer-submenu').forEach(sm => {
			sm.classList.remove('expanded');
		});
		document.querySelectorAll('.drawer-expand-icon').forEach(ic => {
			ic.classList.remove('expanded');
			ic.textContent = '▶';
		});
		
		// Open this submenu
		submenu.classList.add('expanded');
		icon.classList.add('expanded');
		icon.textContent = '▼';
	}
}

// ===== UPDATE ACTIVE STATE IN DRAWER =====
function updateDrawerActiveState() {
	// Reset all drawer items and submenu items
	document.querySelectorAll('.drawer-item').forEach(item => {
		item.classList.remove('active');
	});
	document.querySelectorAll('.drawer-submenu-item').forEach(item => {
		item.classList.remove('active');
	});
	
	// Set active based on current bab
	if (currentBab) {
		const activeItem = document.querySelector(`.drawer-item[data-bab="${currentBab}"]`);
		if (activeItem) {
			activeItem.classList.add('active');
		}
	}
	
	// Set active submenu item based on current grammar point
	if (currentGrammarPoint) {
		const activeSubmenuItem = document.querySelector(`.drawer-submenu-item[data-point="${currentGrammarPoint}"]`);
		if (activeSubmenuItem) {
			activeSubmenuItem.classList.add('active');
			// Also expand the parent submenu
			const parentGroup = activeSubmenuItem.closest('.drawer-bab-group');
			if (parentGroup) {
				const babNum = parentGroup.getAttribute('data-bab');
				const submenu = document.getElementById(`submenu-${babNum}`);
				const icon = document.getElementById(`expand-icon-${babNum}`);
				if (submenu && !submenu.classList.contains('expanded')) {
					submenu.classList.add('expanded');
					icon.classList.add('expanded');
					icon.textContent = '▼';
				}
			}
		}
	}
}

// ===== SHOW SECTION =====
function showSection(sectionId, targetId = null) {
	// Update current state
	currentSection = sectionId;
	
	// Check if targetId is a bab number
	if (targetId && typeof targetId === 'number') {
		currentBab = targetId;
		currentGrammarPoint = null; // Reset grammar point when switching bab
	}
	
	// Check if targetId is a grammar point ID
	if (targetId && typeof targetId === 'string' && targetId.startsWith('grammar-')) {
		const pointNum = targetId.replace('grammar-', '');
		currentGrammarPoint = pointNum;
	}
	
	// Hide all sections
	document.querySelectorAll('section').forEach(sec => {
		sec.classList.add('hidden');
	});

	// Show selected
	const targetSection = document.getElementById(sectionId);
	if (targetSection) {
		targetSection.classList.remove('hidden');
	}

	// Update nav title
	const navTitle = document.getElementById('current-section-title');
	if (sectionId === 'contents') {
		navTitle.textContent = 'TRY! N2';
	} else if (sectionId === 'bab1-header') {
		navTitle.textContent = 'Bab 1';
	} else if (sectionId === 'bab2-header') {
		navTitle.textContent = 'Bab 2';
	} else if (sectionId === 'grammar-list') {
		navTitle.textContent = 'Grammar';
	} else if (sectionId === 'check') {
		navTitle.textContent = 'Check';
	} else if (sectionId === 'matome') {
		navTitle.textContent = 'まとめ';
	} else if (sectionId === 'bab2-check') {
		navTitle.textContent = 'Check';
	} else if (sectionId === 'bab2-matome') {
		navTitle.textContent = 'まとめ';
	}

	// Update drawer active state
	updateDrawerActiveState();

	// Scroll to target element if specified (for grammar points)
	if (targetId && typeof targetId === 'string' && targetId.startsWith('grammar-')) {
		setTimeout(() => {
			const grammarElement = document.getElementById(targetId);
			if (grammarElement) {
				grammarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	} else {
		// Scroll to top
		window.scrollTo(0, 0);
	}
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
	// Load translation preferences from localStorage
	const savedEnglish = localStorage.getItem('showEnglish');
	const savedIndonesian = localStorage.getItem('showIndonesian');
	
	if (savedEnglish === 'true') {
		showEnglish = true;
	}
	if (savedIndonesian === 'true') {
		showIndonesian = true;
	}
	
	// Apply translations after a short delay to ensure DOM is ready
	setTimeout(() => {
		updateTranslationButtons();
		applyTranslations();
	}, 500);
	
	loadDatabase();
	
	// Setup hamburger button click handler
	const hamburgerBtn = document.getElementById('hamburger-btn');
	if (hamburgerBtn) {
		hamburgerBtn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			toggleDrawer();
		});
		
		hamburgerBtn.addEventListener('touchstart', function(e) {
			e.preventDefault();
			e.stopPropagation();
			toggleDrawer();
		}, { passive: false });
	}
	
	// Setup English translate button click handler
	const translateEnBtn = document.getElementById('translate-en-btn');
	if (translateEnBtn) {
		translateEnBtn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			toggleEnglish();
		});
	}
	
	// Setup Indonesian translate button click handler
	const translateIdBtn = document.getElementById('translate-id-btn');
	if (translateIdBtn) {
		translateIdBtn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			toggleIndonesian();
		});
	}
	
	// Initialize Text-to-Speech
	initTTS();
});

// ===== UPDATE TRANSLATION BUTTONS STATE =====
function updateTranslationButtons() {
	const translateEnBtn = document.getElementById('translate-en-btn');
	const translateIdBtn = document.getElementById('translate-id-btn');
	
	if (translateEnBtn) {
		if (showEnglish) {
			translateEnBtn.classList.add('en-active');
			translateEnBtn.querySelector('.translate-text').textContent = 'ON';
		} else {
			translateEnBtn.classList.remove('en-active');
			translateEnBtn.querySelector('.translate-text').textContent = 'EN';
		}
	}
	
	if (translateIdBtn) {
		if (showIndonesian) {
			translateIdBtn.classList.add('id-active');
			translateIdBtn.querySelector('.translate-text').textContent = 'ON';
		} else {
			translateIdBtn.classList.remove('id-active');
			translateIdBtn.querySelector('.translate-text').textContent = 'ID';
		}
	}
}

// ===== APPLY TRANSLATIONS =====
function applyTranslations() {
	// Handle English translations
	document.querySelectorAll('.translation-en').forEach(el => {
		if (showEnglish) {
			el.classList.add('visible');
		} else {
			el.classList.remove('visible');
		}
	});
	
	// Handle Indonesian translations
	document.querySelectorAll('.translation-id').forEach(el => {
		if (showIndonesian) {
			el.classList.add('visible');
		} else {
			el.classList.remove('visible');
		}
	});
}

// ===== TOGGLE ENGLISH TRANSLATION =====
function toggleEnglish() {
	showEnglish = !showEnglish;
	updateTranslationButtons();
	applyTranslations();
	localStorage.setItem('showEnglish', showEnglish);
}

// ===== TOGGLE INDONESIAN TRANSLATION =====
function toggleIndonesian() {
	showIndonesian = !showIndonesian;
	updateTranslationButtons();
	applyTranslations();
	localStorage.setItem('showIndonesian', showIndonesian);
}

// ===== REFRESH CURRENT SECTION =====
function refreshCurrentSection() {
	// Hide all sections first
	document.querySelectorAll('section').forEach(sec => {
		sec.classList.add('hidden');
	});
	
	// Show current section
	const targetSection = document.getElementById(currentSection);
	if (targetSection) {
		targetSection.classList.remove('hidden');
	}
}

// ===== GET TRANSLATION TEXT =====
function getTranslation(element, type) {
	if (!element) return '';
	
	const idText = element.querySelector(`${type}_id`)?.textContent || '';
	return idText ? `<div class="translation-id">${idText}</div>` : '';
}

// ===== TEXT TO SPEECH (TTS) =====
let currentSpeech = null;
let isSpeaking = false;

function initTTS() {
	// Check if browser supports speech synthesis
	if (!('speechSynthesis' in window)) {
		console.log('Text-to-speech not supported in this browser');
		return;
	}
	
	// Add TTS to Japanese text elements
	addTTSToJapaneseText();
	
	// Re-apply TTS when section changes
	const observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				const target = mutation.target;
				if (target.tagName === 'SECTION' && !target.classList.contains('hidden')) {
					setTimeout(addTTSToJapaneseText, 100);
				}
			}
		});
	});
	
	document.querySelectorAll('section').forEach(section => {
		observer.observe(section, { attributes: true });
	});
}

function addTTSToJapaneseText() {
	// Elements to exclude from TTS
	const excludeSelectors = [
		'.sidebar-drawer',
		'.drawer-submenu-item',
		'.drawer-item',
		'.drawer-item-expandable',
		'.quick-item',
		'.quick-list',
		'a',
		'button',
		'.translation-en',
		'.translation-id',
		'.dekiru-en',
		'.dekiru-id',
		'.grammar-pattern-id',
		'.example-id',
		'.quiz-id',
		'.page-ref-id',
		'.label-id',
		'.content-id',
		'.contact-id',
		'.question-id',
		'.option-id',
		'.ref-id',
		'.instruksi-id',
		'.soal-id',
		'.pilihan-id',
		'.matome-subtitle-id',
		'.bab-header-id',
		'.category-id',
		'.note-id',
		'.job-note-id',
		'.job-ad-title-id',
		'.job-ad-subtitle-id',
		'.grammar-note-id',
		'.plus-desc-id',
		'.plus-pattern-id',
		'.yatte-miyou-ref',
		'.check-ref',
		'.page-number'
	];
	
	// Find all visible sections
	const visibleSections = document.querySelectorAll('section:not(.hidden)');
	
	visibleSections.forEach(section => {
		// Skip sidebar
		if (section.closest('.sidebar-drawer')) return;
		
		// Get all text nodes in the section
		const walker = document.createTreeWalker(
			section,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);
		
		const textNodes = [];
		let node;
		while (node = walker.nextNode()) {
			// Check if parent is excluded
			let parent = node.parentElement;
			let shouldExclude = false;
			
			while (parent) {
				// Check if parent matches any exclude selector
				for (const selector of excludeSelectors) {
					if (parent.matches && parent.matches(selector)) {
						shouldExclude = true;
						break;
					}
				}
				
				// Check if parent already has TTS
				if (parent.classList && parent.classList.contains('tts-enabled')) {
					shouldExclude = true;
					break;
				}
				
				// Check if parent is inside sidebar
				if (parent.closest && parent.closest('.sidebar-drawer')) {
					shouldExclude = true;
					break;
				}
				
				parent = parent.parentElement;
			}
			
			if (!shouldExclude && node.textContent.trim().length > 0) {
				// Check if text contains Japanese characters
				if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(node.textContent)) {
					textNodes.push(node);
				}
			}
		}
		
		// Wrap Japanese text elements with TTS-enabled span
		textNodes.forEach(textNode => {
			const parent = textNode.parentElement;
			if (!parent) return;
			
			// Skip if parent is already processed
			if (parent.classList && parent.classList.contains('tts-enabled')) return;
			
			// Create wrapper span
			const wrapper = document.createElement('span');
			wrapper.classList.add('tts-enabled');
			wrapper.textContent = textNode.textContent;
			wrapper.setAttribute('data-tts-text', textNode.textContent.trim());
			
			// Add click event for TTS
			wrapper.addEventListener('click', function(e) {
				e.stopPropagation();
				speakJapanese(this.getAttribute('data-tts-text'), this);
			});
			
			// Replace text node with wrapper
			if (parent.childNodes.length === 1 && parent.childNodes[0] === textNode) {
				parent.textContent = '';
				parent.appendChild(wrapper);
			} else {
				textNode.parentNode.replaceChild(wrapper, textNode);
			}
		});
	});
}

function speakJapanese(text, element) {
	// Cancel any ongoing speech
	if (window.speechSynthesis.speaking) {
		window.speechSynthesis.cancel();
		
		// Remove speaking class from all elements
		document.querySelectorAll('.tts-speaking').forEach(el => {
			el.classList.remove('tts-speaking');
		});
		
		// If clicking the same element, just stop
		if (currentSpeech === element) {
			currentSpeech = null;
			isSpeaking = false;
			return;
		}
	}
	
	// Create utterance
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = 'ja-JP';
	utterance.rate = 0.9;
	utterance.pitch = 1;
	
	// Find Japanese voice
	const voices = window.speechSynthesis.getVoices();
	const japaneseVoice = voices.find(voice => voice.lang.startsWith('ja'));
	if (japaneseVoice) {
		utterance.voice = japaneseVoice;
	}
	
	// Add speaking class
	element.classList.add('tts-speaking');
	currentSpeech = element;
	isSpeaking = true;
	
	// Handle speech end
	utterance.onend = function() {
		element.classList.remove('tts-speaking');
		currentSpeech = null;
		isSpeaking = false;
	};
	
	utterance.onerror = function(event) {
		console.error('TTS Error:', event.error);
		element.classList.remove('tts-speaking');
		currentSpeech = null;
		isSpeaking = false;
	};
	
	// Speak
	window.speechSynthesis.speak(utterance);
}

// Load voices when available
if ('speechSynthesis' in window) {
	window.speechSynthesis.onvoiceschanged = function() {
		// Voices loaded
	};
}

