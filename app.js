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
            speakJapanese(this.textContent); // Hanya 1 parameter
        });
    });
}
