// Minimal JS to prevent console errors and provide basic interactivity
document.addEventListener('DOMContentLoaded', function () {
  // smooth scroll helper (preserve native window.scrollTo)
  const nativeScrollTo = window.scrollTo.bind(window);
  window.scrollTo = function (arg) {
    if (typeof arg === 'string') {
      const el = document.querySelector(arg);
      if (el) return el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // if called with numbers or options, delegate to native
    return nativeScrollTo(arg);
  };
  window.scrollToElement = function (sel) { const el = document.querySelector(sel); if (el) el.scrollIntoView({behavior:'smooth'}); };

  // theme toggle: use `light` class to switch to daytime theme (default is dark)
  const themeBtn = document.getElementById('themeToggle');
  function applyTheme(isLight) {
    document.body.classList.toggle('light', !!isLight);
    if (!themeBtn) return;
    themeBtn.textContent = isLight ? '☀️' : '🌙';
  }
  // initialize from localStorage
  const saved = localStorage.getItem('theme');
  const isLightInit = saved === 'light';
  applyTheme(isLightInit);
  if (themeBtn) themeBtn.addEventListener('click', ()=>{
    const nowLight = !document.body.classList.contains('light');
    applyTheme(nowLight);
    localStorage.setItem('theme', nowLight ? 'light' : 'dark');
  });

  // navbar scroll behavior
  const navbar = document.getElementById('navbar');
  const onScroll = ()=> { if (!navbar) return; if (window.scrollY > 20) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled'); };
  onScroll(); window.addEventListener('scroll', onScroll);

  // mobile menu
  const burger = document.getElementById('burger');
  let mobileMenu;
  if (burger) {
    mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#service">Services</a>
      <a href="#portfolio">Portfolio</a>
      <a href="#contact">Contact</a>
    `;
    document.body.appendChild(mobileMenu);
    burger.addEventListener('click', ()=> mobileMenu.classList.toggle('show'));
    mobileMenu.addEventListener('click', (e)=>{ if (e.target.tagName === 'A') mobileMenu.classList.remove('show'); });
  }

  // handle photo upload preview
  const fileIn = document.getElementById('photoFile');
  const upImg = document.getElementById('uploadedImg');
  const ovImg = document.getElementById('overflowImg');
  const hint = document.getElementById('photoHint');
  if (fileIn) {
    fileIn.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      if (upImg) { upImg.src = url; upImg.style.display = 'block'; }
      if (ovImg) { ovImg.src = url; ovImg.style.display = 'block'; }
      if (hint) hint.style.display = 'none';
    });
  }
  // if a default static image is provided, display it
  if (upImg) {
    upImg.addEventListener('load', ()=>{
      upImg.style.display = 'block';
      if (hint) hint.style.display = 'none';
    });
    upImg.addEventListener('error', ()=>{
      upImg.style.display = 'none';
      if (hint) hint.style.display = '';
    });
    // if already cached and loaded
    if (upImg.complete && upImg.naturalWidth && upImg.naturalWidth > 0) {
      upImg.style.display = 'block';
      if (hint) hint.style.display = 'none';
    }
  }
  if (ovImg) {
    ovImg.addEventListener('load', ()=>{ ovImg.style.display = 'block'; });
    ovImg.addEventListener('error', ()=>{ ovImg.style.display = 'none'; });
  }

  // Photo move controls: up/down by 5%
  const upBtn = document.querySelector('.photo-move.btn-up');
  const downBtn = document.querySelector('.photo-move.btn-down');
  function getPortraitY() {
    if (!upImg) return 38;
    const inline = upImg.style.getPropertyValue('--portrait-pos-y');
    const comp = getComputedStyle(upImg).getPropertyValue('--portrait-pos-y');
    const v = (inline || comp || '').trim();
    if (!v) return 38;
    return parseFloat(v.replace('%','')) || 38;
  }
  function setPortraitY(n) {
    if (!upImg) return;
    const clamped = Math.max(6, Math.min(80, n));
    upImg.style.setProperty('--portrait-pos-y', clamped + '%');
  }
  if (upBtn) upBtn.addEventListener('click', ()=> setPortraitY(getPortraitY() - 5));
  if (downBtn) downBtn.addEventListener('click', ()=> setPortraitY(getPortraitY() + 5));

  // animate skill bars
  document.querySelectorAll('.skill-bar').forEach(el=>{
    const pct = el.getAttribute('data-pct') || el.dataset.pct;
    setTimeout(()=> el.style.width = pct + '%', 200);
  });

  // set CSS --i variable from data-i attributes (avoid Jinja braces in inline styles)
  document.querySelectorAll('[data-i]').forEach(el=>{
    const v = el.getAttribute('data-i');
    if (v !== null) el.style.setProperty('--i', v);
  });

  // reveal on scroll
  const reveal = ()=>{
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el=>{
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 80) el.classList.add('revealed');
    });
  };
  reveal(); window.addEventListener('scroll', reveal);

  // simple typed words cycle
  const typedEl = document.getElementById('typed');
  const words = ["AI Engineer","ML Developer","LLM Specialist","Deep Learning Expert"];
  if (typedEl) {
    let i=0; setInterval(()=>{ typedEl.textContent = words[i++ % words.length]; }, 1800);
  }

  // contact form send (with loading state and disabled button)
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) sendBtn.addEventListener('click', async ()=>{
    const name = document.getElementById('f-name').value || '';
    const email = document.getElementById('f-email').value || '';
    const subject = document.getElementById('f-subject').value || '';
    const message = document.getElementById('f-msg').value || '';
    const fb = document.getElementById('form-feedback');
    if (!name || !email || !message) { if (fb) fb.textContent = 'Please fill required fields.'; return; }

    // disable and show loading
    sendBtn.disabled = true;
    const original = sendBtn.innerHTML;
    sendBtn.innerHTML = 'Sending…';
    if (fb) fb.textContent = '';
    try {
      const res = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,subject,message})});
      const j = await res.json();
      if (res.ok) {
        if (fb) fb.textContent = j.message || 'Message sent — thank you!';
        // clear form
        document.getElementById('f-name').value = '';
        document.getElementById('f-email').value = '';
        document.getElementById('f-subject').value = '';
        document.getElementById('f-msg').value = '';
      } else {
        if (fb) fb.textContent = j.error || 'Failed to send message.';
      }
    } catch (err) {
      if (fb) fb.textContent = 'Network error — please try later.';
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = original;
    }
  });

  // Contact button: open the user's email client via mailto (with phone in body)
  const contactBtn = document.getElementById('contactBtn');
  if (contactBtn) {
    contactBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const email = contactBtn.dataset.email || '';
      const phone = contactBtn.dataset.phone || '';
      const subject = 'Project Inquiry';
      let body = '';
      if (phone) body += `Phone: ${phone}\n\n`;
      body += 'Hi Soumyadip,%0D%0A%0D%0AI would like to discuss a project with you. Please get back to me with details.%0D%0A%0D%0AThanks.';
      const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailto;
    });
  }
  
// Resume modal controls
// (removed duplicate simple modal block — consolidated modal handling appears later)

  // Resume video modal
  const resumeBtn = document.getElementById('resumeBtn');
  const videoModal = document.getElementById('videoModal');
  const videoClose = document.getElementById('videoClose');
  const resumeVideo = document.getElementById('resumeVideo');
  function openVideoModal() {
    if (!videoModal) return;
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden','false');
    try { resumeVideo.currentTime = 0; resumeVideo.play().catch(()=>{}); } catch(e){}
  }
  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden','true');
    try { resumeVideo.pause(); resumeVideo.currentTime = 0; } catch(e){}
  }
  if (resumeBtn) resumeBtn.addEventListener('click', (e)=>{ e.preventDefault(); openVideoModal(); });
  if (videoClose) videoClose.addEventListener('click', (e)=>{ e.preventDefault(); closeVideoModal(); });
  // click outside inner to close
  if (videoModal) videoModal.addEventListener('click', (e)=>{ if (e.target === videoModal) closeVideoModal(); });
  // ESC key to close
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && videoModal && videoModal.classList.contains('open')) closeVideoModal(); });
});
