// Floating card subtle lift on scroll
(() => {
  const cards = document.querySelectorAll('.card');
  const track = document.querySelector('.swipe-track');
  const docs = document.querySelectorAll('.doc');

  function onScroll(){
    const top = window.scrollY || document.documentElement.scrollTop;
    cards.forEach((c, i) => {
      const rect = c.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      if(visible) c.classList.add('float'); else c.classList.remove('float');
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Doctor swipe gestures (heavy gesture controls) — improved snap and pointer handling
  if(track && docs.length){
    let pointerId = null, startX = 0, offsetX = 0, dragging = false;
    let cardWidth = docs[0].getBoundingClientRect().width + 12;
    const recompute = () => { cardWidth = docs[0].getBoundingClientRect().width + 12; };
    let minOffset = () => -((docs.length - 1) * cardWidth);

    const setTransform = x => { track.style.transform = `translateX(${x}px)`; };
    setTransform(0);

    track.addEventListener('pointerdown', e => {
      dragging = true; pointerId = e.pointerId; startX = e.clientX; track.setPointerCapture(pointerId); track.style.transition = 'none';
    });

    track.addEventListener('pointermove', e => {
      if(!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const x = Math.max(minOffset(), Math.min(0, offsetX + dx));
      setTransform(x);
    });

    const snapTo = (newOffset) => {
      const snap = Math.round(newOffset / cardWidth) * cardWidth;
      offsetX = Math.max(minOffset(), Math.min(0, snap));
      track.style.transition = 'transform 360ms cubic-bezier(.2,.9,.2,1)';
      setTransform(offsetX);
    };

    track.addEventListener('pointerup', e => {
      if(e.pointerId !== pointerId) return;
      dragging = false; track.releasePointerCapture(pointerId);
      const dx = e.clientX - startX; const newOffset = Math.max(minOffset(), Math.min(0, offsetX + dx));
      snapTo(newOffset);
    });

    track.addEventListener('pointercancel', e => {
      if(e.pointerId !== pointerId) return;
      dragging = false; track.releasePointerCapture(pointerId);
      snapTo(offsetX);
    });

    window.addEventListener('resize', () => { recompute(); snapTo(offsetX); });
  }

  // Bottom nav behaviour for mobile
  const bnItems = document.querySelectorAll('.bn-item');
  bnItems.forEach(it => it.addEventListener('click', () => { bnItems.forEach(b=>b.classList.remove('active')); it.classList.add('active'); }));

  // booking submit (demo) — show a minimal confirmation
  const form = document.getElementById('bookingForm');
  if(form) form.addEventListener('submit', e=>{
    e.preventDefault();
    const d = new FormData(form);
    alert(`Appointment requested for ${d.get('dept')} on ${d.get('date')} at ${d.get('time')}`);
  });

  // Full appointment form handling
  const appt = document.getElementById('appointmentForm');
  if(appt){
    appt.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(appt);
      if(!fd.get('name') || !fd.get('email') || !fd.get('date') || !fd.get('time')){ alert('Please complete all required fields.'); return; }
      alert(`Request received for ${fd.get('name')} — ${fd.get('dept')} on ${fd.get('date')} at ${fd.get('time')}`);
      appt.reset();
    });
  }

  // Sidebar nav: scroll to services and highlight matching card
  const navButtons = document.querySelectorAll('.nav-btn');
  let lastDept = null;
  navButtons.forEach(b => b.addEventListener('click', ()=>{
    const dept = (b.dataset.dept||'').toLowerCase(); lastDept = dept;
    const servicesEl = document.getElementById('services'); if(servicesEl) servicesEl.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>{
      const card = document.querySelector(`.card[data-dept="${dept}"]`);
      if(card){ card.scrollIntoView({behavior:'smooth',block:'center'}); card.classList.add('highlight'); setTimeout(()=>card.classList.remove('highlight'),1600); }
    },480);
    navButtons.forEach(n=>n.classList.remove('active')); b.classList.add('active');
  }));

  // bottom nav anchors
  const bottomNavMap = ['#hero','#doctors','#appointment','#about'];
  document.querySelectorAll('.bn-item').forEach((bn,i)=>bn.addEventListener('click', ()=>{
    const sel = bottomNavMap[i]; if(!sel) return; const el = document.querySelector(sel); if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
    document.querySelectorAll('.bn-item').forEach(x=>x.classList.remove('active')); bn.classList.add('active');
  }));

  // hero CTA buttons
  document.querySelectorAll('.hero-cta [data-target]').forEach(btn=>btn.addEventListener('click', ()=>{
    const sel = btn.dataset.target; const el = document.querySelector(sel); if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
  }));

  // Reviews autoplay
  const reviewsTrack = document.getElementById('reviewsTrack');
  if(reviewsTrack){ let rIndex = 0; const children = reviewsTrack.children; const total = children.length; setInterval(()=>{ rIndex=(rIndex+1)%total; const x = -(rIndex*(children[0].getBoundingClientRect().width+18)); reviewsTrack.style.transition='transform 560ms ease'; reviewsTrack.style.transform=`translateX(${x}px)`; },4800); }

  // FAQ toggles
  document.querySelectorAll('.faq-item .faq-question').forEach(q=>q.addEventListener('click', ()=>{ const it=q.parentElement; it.classList.toggle('open'); const t=q.querySelector('.toggle'); t.textContent = it.classList.contains('open')? '−' : '+'; }));

  // Counters
  const counters = document.querySelectorAll('.counter');
  if(counters.length){
    const run = el=>{ const target=parseInt(el.dataset.target,10)||0; let v=0; const step=Math.max(1,Math.floor(target/60)); const iv=setInterval(()=>{ v+=step; if(v>=target){ el.textContent=target; clearInterval(iv);} else el.textContent=v; },20); };
    const io = new IntersectionObserver((ents,obs)=>{ ents.forEach(en=>{ if(en.isIntersecting){ run(en.target); obs.unobserve(en.target); } }); },{threshold:0.6});
    counters.forEach(c=>io.observe(c));
  }

})();
