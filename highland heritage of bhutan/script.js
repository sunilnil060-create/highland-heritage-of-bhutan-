document.addEventListener("DOMContentLoaded", function () {

    // ── HERO SLIDESHOW ──
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        slides.forEach(s => s.classList.remove('active'));
        slides[0].classList.add('active');
        setInterval(function () {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // ── MEDIA LIBRARY SLIDER ──
    const DURATION = 4000;
    const cards    = Array.from(document.querySelectorAll('.ml-card'));
    const dots     = Array.from(document.querySelectorAll('.ml-dot'));
    const counter  = document.getElementById('mlCounter');
    const fill     = document.getElementById('mlAutoplayFill');
    const wrap     = document.querySelector('.ml-slider-wrap');
    const video    = document.getElementById('mlVideo');
    const mlSlides = document.getElementById('mlSlides');

    if (cards.length && mlSlides) {
        let current   = 0;
        let direction = 1;
        let timer     = null;

        function syncHeight() {
            if (mlSlides && cards[current]) {
                mlSlides.style.height = cards[current].offsetHeight + 'px';
            }
        }

        function pad(n) { return String(n).padStart(2, '0'); }

        function updateCounter() {
            if (counter) counter.textContent = pad(current + 1) + ' / ' + pad(cards.length);
        }

        function goTo(next, dir) {
            if (next === current) return;
            var prev = current;
            current  = next;

            cards[prev].classList.remove('active');
            cards[prev].classList.add(dir > 0 ? 'exit-left' : 'exit-right');

            cards[next].style.transform = dir > 0 ? 'translateX(50px)' : 'translateX(-50px)';
            cards[next].style.opacity   = '0';
            cards[next].style.position  = 'absolute';
            cards[next].offsetHeight;
            cards[next].classList.add('active');
            cards[next].style.transform = '';
            cards[next].style.opacity   = '';
            cards[next].style.position  = '';

            setTimeout(function () {
                cards[prev].classList.remove('exit-left', 'exit-right');
                syncHeight();
            }, 850);

            if (video) {
                if (next === 0) { video.currentTime = 0; video.play(); }
                else { video.pause(); }
            }

            dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
            updateCounter();
        }

        function resetFill() {
            if (!fill) return;
            fill.style.transition = 'none';
            fill.style.width = '0%';
            fill.offsetHeight;
            fill.style.transition = 'width ' + DURATION + 'ms linear';
            fill.style.width = '100%';
        }

        function advance() {
            var next = current + direction;
            if (next >= cards.length)  { direction = -1; next = cards.length - 2; }
            else if (next < 0)         { direction =  1; next = 1; }
            goTo(next, direction);
            resetFill();
        }

        function startAuto() {
            clearInterval(timer);
            timer = setInterval(advance, DURATION);
            resetFill();
        }

        cards[0].classList.add('active');
        updateCounter();
        if (video) video.play();
        syncHeight();
        startAuto();
        window.addEventListener('load', syncHeight);
        window.addEventListener('resize', syncHeight);

        var btnNext = document.getElementById('mlNext');
        if (btnNext) btnNext.addEventListener('click', function () {
            var next = (current + 1) % cards.length;
            direction = 1; goTo(next, 1); startAuto();
        });

        var btnPrev = document.getElementById('mlPrev');
        if (btnPrev) btnPrev.addEventListener('click', function () {
            var next = (current - 1 + cards.length) % cards.length;
            direction = -1; goTo(next, -1); startAuto();
        });

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                var dir = i > current ? 1 : -1;
                direction = dir; goTo(i, dir); startAuto();
            });
        });

        if (wrap) {
            wrap.addEventListener('mouseenter', function () {
                clearInterval(timer);
                if (!fill) return;
                var w  = parseFloat(window.getComputedStyle(fill).width);
                var pw = fill.parentElement.offsetWidth;
                fill.style.transition = 'none';
                fill.style.width = ((w / pw) * 100).toFixed(1) + '%';
            });
            wrap.addEventListener('mouseleave', function () { startAuto(); });
        }
    }

    // ── ML VIDEO: inline play button ──
    const mlPlayBtn = document.getElementById('mlPlayBtn');
    const mlVideo   = document.getElementById('mlVideo');

    if (mlPlayBtn && mlVideo) {
        mlPlayBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            mlVideo.muted    = false;
            mlVideo.loop     = false;
            mlVideo.controls = true;
            mlVideo.play();
            mlPlayBtn.style.display = 'none';
            mlVideo.addEventListener('ended', function () {
                mlVideo.controls = false;
                mlPlayBtn.style.display = 'flex';
            }, { once: true });
        });
    }

    // ── FILM PAGE: media-box → fullscreen ──
    var boxes = document.querySelectorAll('.media-box');
    boxes.forEach(function (box) {
        box.addEventListener('click', function () {
            var src   = box.dataset.src;
            var title = box.dataset.title;
            var desc  = box.dataset.desc;
            if (!src) return;

            var overlay  = document.getElementById('videoOverlay');
            var fsVideo  = document.getElementById('fullscreenVideo');
            var fsSource = document.getElementById('fullscreenSource');
            var fsTitle  = document.getElementById('fullscreenTitle');
            var fsText   = document.getElementById('fullscreenText');

            if (fsTitle) fsTitle.textContent = title || '';
            if (fsText)  fsText.textContent  = desc  || '';
            fsSource.src = src;
            fsVideo.load();
            fsVideo.play();
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // ── VIDEO OVERLAY: close on backdrop click ──
    var overlay = document.getElementById('videoOverlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) window.closeVideoFull();
        });
    }

    // ── LANGUAGE TOGGLE ──
    const langWrapper  = document.getElementById('lang-wrapper');
    const langBtn      = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const langLabel    = document.getElementById('lang-label');

    if (langBtn && langWrapper && langDropdown) {

        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = langWrapper.classList.contains('open');
            langWrapper.classList.toggle('open', !isOpen);
            langDropdown.style.display = isOpen ? 'none' : 'flex';
        });

        document.addEventListener('click', function () {
            langWrapper.classList.remove('open');
            langDropdown.style.display = 'none';
        });

        langDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        document.querySelectorAll('.lang-option').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (btn.hasAttribute('disabled')) return;

                document.querySelectorAll('.lang-option').forEach(function (b) {
                    b.classList.remove('active');
                    b.querySelector('.lang-check').textContent = '';
                });

                btn.classList.add('active');
                btn.querySelector('.lang-check').textContent = '✓';
                langLabel.textContent = btn.querySelector('.lang-code').textContent;

                langWrapper.classList.remove('open');
                langDropdown.style.display = 'none';
            });
        });
    }

});

// ── CLOSE FULLSCREEN VIDEO ──
window.closeVideoFull = function () {
    var overlay  = document.getElementById('videoOverlay');
    var fsVideo  = document.getElementById('fullscreenVideo');
    var fsSource = document.getElementById('fullscreenSource');
    if (fsVideo)  { fsVideo.pause(); fsVideo.currentTime = 0; }
    if (fsSource) fsSource.src = '';
    if (overlay)  overlay.classList.remove('active');
    document.body.style.overflow = '';
};

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeVideoFull();
});