if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

function isOnline() {
  return navigator.onLine;
}

// ---------- DATA ----------
const PACKAGES = [
  { name:'SILVER', price:55, outfits:1, type:'individual', features:['3 Photos','1 Outfit','Basic editing'] },
  { name:'GOLD', price:100, outfits:2, type:'individual', features:['6 Photos','2 Outfits','Premium editing'] },
  { name:'PLATINUM', price:150, outfits:3, type:'individual', features:['9 Photos','3 Outfits','Custom Background','Priority'] },
  { name:'COUPLE SILVER', price:120, outfits:1, type:'couple', features:['3 images','1 outfit each','Studio layout'] },
  { name:'COUPLE GOLD', price:230, outfits:2, type:'couple', features:['4 images','2 outfits each','Creative scene'] },
  { name:'COUPLE PLATINUM', price:350, outfits:3, type:'couple', features:['6 images','3 outfits each','Premium concepts'] }
];
const SERVICES = [
  { name:'Basic Retouch', price:30 },{ name:'Advanced Retouch', price:50 },{ name:'Outfit Change', price:15 },
  { name:'Hairstyle Change', price:15 },{ name:'Makeup Application', price:20 },{ name:'Pose Adjustment', price:10 },
  { name:'Background Change', price:10 },{ name:'Two People Combined', price:50 },{ name:'Object Removal', price:20 },
  { name:'Full Scene Replacement', price:50 },{ name:'Cartoon Style', price:40 },{ name:'Sky Enhancement', price:30 }
];

let orderType = 'photoshoot', selectedPackage = null, selectedServices = [], uploadedFiles = {}, currentPkgType = 'individual', makeupEnabled = { person1: false, person2: false };

function saveDraft(){ const d={orderType,selectedPackage,selectedServices,makeupEnabled,currentPkgType}; localStorage.setItem('gidigba_draft',JSON.stringify(d)); }
function loadDraft(){ const d=localStorage.getItem('gidigba_draft'); if(d){ const p=JSON.parse(d); orderType=p.orderType; selectedPackage=p.selectedPackage; selectedServices=p.selectedServices||[]; makeupEnabled=p.makeupEnabled||{person1:false,person2:false}; currentPkgType=p.currentPkgType||'individual'; } }
window.addEventListener('beforeunload',saveDraft);
loadDraft();

window.showScreen = function(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  if (id === 'packages') renderPackages();
  if (id === 'custom') renderServices();
  if (id === 'upload') renderUploadFields();
};
window.goBackFromUpload = () => showScreen(orderType === 'photoshoot' ? 'packages' : 'custom');

window.startPhotoshoot = function() { orderType = 'photoshoot'; currentPkgType = 'individual'; showScreen('packages'); };
window.startCustom = function() { orderType = 'custom'; showScreen('custom'); };

window.setPkgType = function(type) {
  currentPkgType = type;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab' + (type==='individual'?'Individual':'Couple')).classList.add('active');
  renderPackages();
};

function renderPackages() {
  const filtered = PACKAGES.filter(p => p.type === currentPkgType);
  document.getElementById('packageContainer').innerHTML = filtered.map(p => `
    <div class="pkg-card glass ${selectedPackage?.name===p.name?'selected':''}" onclick="selectPackage('${p.name}')">
      <div class="pkg-name">${p.name}</div><div class="pkg-price">GH₵ ${p.price}</div>
      <ul class="pkg-features">${p.features.map(f=>`<li><i class="fas fa-check"></i> ${f}</li>`).join('')}</ul>
      ${selectedPackage?.name===p.name ? '<div style="color:var(--lemon); margin-top:10px;">✓ SELECTED</div>' : ''}
    </div>`).join('');
}
window.selectPackage = function(n) { selectedPackage = PACKAGES.find(p => p.name === n); document.getElementById('continuePkgBtn').disabled = false; renderPackages(); showToast(`Selected ${n}`, true); };

function renderServices() {
  document.getElementById('servicesContainer').innerHTML = SERVICES.map((s,i) => `
    <div style="flex:0 0 140px; background:var(--card-bg); border:2px solid ${selectedServices.includes(i)?'var(--lemon)':'var(--border-light)'}; border-radius:16px; padding:16px; text-align:center; cursor:pointer;" onclick="toggleService(${i})">
      <i class="fas fa-sparkles" style="color:var(--lemon); font-size:24px;"></i><h4 style="margin:8px 0;">${s.name}</h4><div style="color:var(--lemon); font-weight:700;">GH₵ ${s.price}</div><div style="color:var(--lemon); margin-top:6px;">${selectedServices.includes(i)?'✓ Selected':'Tap'}</div>
    </div>`).join('');
  updateCustomTotal();
}
window.toggleService = function(i) { if (selectedServices.includes(i)) selectedServices = selectedServices.filter(x => x !== i); else selectedServices.push(i); renderServices(); document.getElementById('continueCustomBtn').disabled = selectedServices.length === 0; };
function updateCustomTotal() { const t = selectedServices.reduce((s,i) => s + SERVICES[i].price, 0); document.getElementById('customTotal').textContent = `GH₵ ${t}`; }

function renderUploadFields() {
  let html = ''; const isPhotoshoot = orderType === 'photoshoot'; const isCouple = isPhotoshoot && selectedPackage?.type === 'couple';
  const outfitCount = isPhotoshoot ? selectedPackage.outfits : (selectedServices.some(i => SERVICES[i].name==='Outfit Change') ? 1 : 0);
  const serviceNames = selectedServices.map(i => SERVICES[i].name);
  const needHairstyle = serviceNames.includes('Hairstyle Change'), needMakeup = serviceNames.includes('Makeup Application'), needBackground = serviceNames.includes('Background Change')||serviceNames.includes('Full Scene Replacement');
  if (isPhotoshoot) {
    html += buildUploadBox('selfieInput','📸 Selfie (required)','camera') + buildUploadBox('fullInput','📸 Full Body (required)','user');
    // --- HAIRSTYLE DESCRIPTION NOW WITH (required) ---
    html += `<textarea class="finput" id="hairstyle1" placeholder="Describe desired hairstyle... (required)"></textarea>` + buildMakeupToggle('person1','Light Makeup');
    for (let i=1; i<=outfitCount; i++) html += `<div style="border:1px solid var(--border-light); border-radius:16px; padding:15px; margin-bottom:15px;"><div style="color:var(--lemon); font-weight:700;">👗 Outfit ${i} (required)</div>` + buildUploadBox(`outfitInput1_${i}`,'Upload outfit','tshirt') + `<textarea class="finput" id="outfitDesc1_${i}" placeholder="Or describe outfit ${i}..."></textarea></div>`;
    if (selectedPackage?.name.includes('PLATINUM')) html += `<textarea class="finput" id="vision" placeholder="Custom background / concept (Platinum)"></textarea>`;
    if (isCouple) {
      html += `<hr style="border-color:var(--border-light); margin:25px 0;"><h3 style="color:var(--lemon);">Partner</h3>` + buildUploadBox('partnerSelfieInput','📸 Partner Selfie (required)','user') + buildUploadBox('partnerFullInput','📸 Partner Full Body (required)','user');
      // --- PARTNER HAIRSTYLE ALSO (required) ---
      html += `<textarea class="finput" id="hairstyle2" placeholder="Partner's desired hairstyle... (required)"></textarea>` + buildMakeupToggle('person2','Light Makeup (Partner)');
      for (let i=1; i<=outfitCount; i++) html += `<div style="border:1px solid var(--border-light); border-radius:16px; padding:15px; margin-bottom:15px;"><div style="color:var(--lemon); font-weight:700;">👗 Partner Outfit ${i} (required)</div>` + buildUploadBox(`outfitInput2_${i}`,'Upload outfit','tshirt') + `<textarea class="finput" id="outfitDesc2_${i}" placeholder="Or describe outfit ${i}..."></textarea></div>`;
    }
  } else {
    html += buildUploadBox('selfieInput','📸 Image to Edit (required)','image');
    if (serviceNames.includes('Outfit Change')) html += `<div style="border:1px solid var(--border-light); border-radius:16px; padding:15px; margin-bottom:15px;"><div style="color:var(--lemon); font-weight:700;">👗 Outfit (required)</div>` + buildUploadBox('outfitInput1_1','Upload outfit','tshirt') + `<textarea class="finput" id="outfitDesc1_1" placeholder="Or describe outfit..."></textarea></div>`;
    if (needHairstyle) html += `<textarea class="finput" id="hairstyle1" placeholder="Describe desired hairstyle... (required)"></textarea>`;
    if (needMakeup) html += buildMakeupToggle('person1','Light Makeup');
    if (needBackground) html += `<textarea class="finput" id="vision" placeholder="Describe background/scene... (required)"></textarea>`;
    html += `<textarea class="finput" id="instructions" placeholder="Any additional instructions..."></textarea>`;
  }
  document.getElementById('uploadFields').innerHTML = html;
  setupPreviews(isPhotoshoot, isCouple, outfitCount);
  makeupEnabled.person1 = makeupEnabled.person2 = false;
  if (document.getElementById('makeupToggle1')) document.getElementById('makeupToggle1').classList.remove('active');
  if (document.getElementById('makeupToggle2')) document.getElementById('makeupToggle2').classList.remove('active');
}
function buildUploadBox(id, title, icon) { return `<div class="upload-box" onclick="document.getElementById('${id}').click()"><input type="file" id="${id}" accept="image/*" capture="environment" style="display:none;"><i class="fas fa-${icon}" style="font-size:24px; color:var(--lemon);"></i><div style="margin-top:8px;">${title}</div><div class="upload-check" style="color:var(--lemon); margin-top:5px; display:none;"><i class="fas fa-check-circle"></i> Ready</div><img id="preview_${id}" style="max-width:100%; border-radius:8px; margin-top:10px; display:none;"></div>`; }
function buildMakeupToggle(person, label) { return `<div class="toggle-row" onclick="toggleMakeup('${person}')"><span>💄 ${label}</span><div class="toggle-switch" id="makeupToggle${person==='person1'?'1':'2'}"></div></div>`; }
window.toggleMakeup = function(person) { if (person==='person1'){ makeupEnabled.person1=!makeupEnabled.person1; document.getElementById('makeupToggle1').classList.toggle('active',makeupEnabled.person1); } else { makeupEnabled.person2=!makeupEnabled.person2; document.getElementById('makeupToggle2').classList.toggle('active',makeupEnabled.person2); } };
function setupPreviews(isPhotoshoot, isCouple, outfitCount) { setupPreview('selfieInput'); if(isPhotoshoot){ setupPreview('fullInput'); if(isCouple){ setupPreview('partnerSelfieInput'); setupPreview('partnerFullInput'); } for(let p=1; p<=(isCouple?2:1); p++) for(let i=1; i<=outfitCount; i++) setupPreview(`outfitInput${p}_${i}`); } else if(document.getElementById('outfitInput1_1')) setupPreview('outfitInput1_1'); }
function setupPreview(id) { const inp=document.getElementById(id); if(!inp)return; inp.addEventListener('change',e=>{ const f=e.target.files[0]; if(!f)return; uploadedFiles[id]=f; const preview=document.getElementById(`preview_${id}`), box=inp.closest('.upload-box'), check=box.querySelector('.upload-check'); const r=new FileReader(); r.onload=ev=>{ preview.src=ev.target.result; preview.style.display='block'; }; r.readAsDataURL(f); box.classList.add('filled'); if(check)check.style.display='block'; }); }

window.goToUpload = function() { if(orderType==='photoshoot'&&!selectedPackage) return showToast('Select a package'); if(orderType==='custom'&&selectedServices.length===0) return showToast('Select at least one service'); showScreen('upload'); };
window.goToReview = function() {
  const isPhotoshoot=orderType==='photoshoot', isCouple=isPhotoshoot&&selectedPackage?.type==='couple';
  const outfitCount=isPhotoshoot?selectedPackage.outfits:(selectedServices.some(i=>SERVICES[i].name==='Outfit Change')?1:0);
  const serviceNames=selectedServices.map(i=>SERVICES[i].name);
  if(!uploadedFiles['selfieInput']) return showToast('Upload the image');
  if(isPhotoshoot){
    if(!uploadedFiles['fullInput']) return showToast('Upload full body');
    // --- VALIDATE HAIRSTYLE DESCRIPTION ---
    if(!document.getElementById('hairstyle1')?.value.trim()) return showToast('Describe your desired hairstyle');
    if(isCouple){
      if(!uploadedFiles['partnerSelfieInput']) return showToast('Upload partner selfie');
      if(!uploadedFiles['partnerFullInput']) return showToast('Upload partner full body');
      if(!document.getElementById('hairstyle2')?.value.trim()) return showToast('Describe partner hairstyle');
    }
    for(let p=1; p<=(isCouple?2:1); p++) for(let i=1; i<=outfitCount; i++){ const has=uploadedFiles[`outfitInput${p}_${i}`], desc=document.getElementById(`outfitDesc${p}_${i}`)?.value.trim(); if(!has&&!desc) return showToast(`Provide outfit ${i} (image or description)${isCouple?` for person ${p}`:''}`); }
  } else {
    if(serviceNames.includes('Outfit Change')){ const has=uploadedFiles['outfitInput1_1'], desc=document.getElementById('outfitDesc1_1')?.value.trim(); if(!has&&!desc) return showToast('Provide outfit (image or description)'); }
    if(serviceNames.includes('Hairstyle Change')&&!document.getElementById('hairstyle1')?.value.trim()) return showToast('Describe hairstyle');
    if((serviceNames.includes('Background Change')||serviceNames.includes('Full Scene Replacement'))&&!document.getElementById('vision')?.value.trim()) return showToast('Describe background');
  }
  let details=''; if(isPhotoshoot){ details=`<h3>${selectedPackage.name} - GH₵ ${selectedPackage.price}</h3><p><strong>Hairstyle:</strong> ${document.getElementById('hairstyle1')?.value||'Not specified'}</p><p><strong>Makeup:</strong> ${makeupEnabled.person1?'Light':'None'}</p>`; for(let i=1; i<=outfitCount; i++) details+=`<p><strong>Outfit ${i}:</strong> ${document.getElementById(`outfitDesc1_${i}`)?.value||'Image provided'}</p>`; if(selectedPackage.name.includes('PLATINUM')) details+=`<p><strong>Background:</strong> ${document.getElementById('vision')?.value||'Not specified'}</p>`; if(isCouple){ details+=`<hr><h4>Partner</h4><p><strong>Hairstyle:</strong> ${document.getElementById('hairstyle2')?.value||'Not specified'}</p><p><strong>Makeup:</strong> ${makeupEnabled.person2?'Light':'None'}</p>`; for(let i=1; i<=outfitCount; i++) details+=`<p><strong>Outfit ${i}:</strong> ${document.getElementById(`outfitDesc2_${i}`)?.value||'Image provided'}</p>`; } } else { const total=selectedServices.reduce((s,i)=>s+SERVICES[i].price,0); details=`<h3>Custom Edit - GH₵ ${total}</h3><p><strong>Services:</strong> ${selectedServices.map(i=>SERVICES[i].name).join(', ')}</p>`; if(document.getElementById('hairstyle1')?.value) details+=`<p><strong>Hairstyle:</strong> ${document.getElementById('hairstyle1').value}</p>`; if(makeupEnabled.person1) details+=`<p><strong>Makeup:</strong> Light</p>`; if(document.getElementById('vision')?.value) details+=`<p><strong>Background:</strong> ${document.getElementById('vision').value}</p>`; if(document.getElementById('instructions')?.value) details+=`<p><strong>Instructions:</strong> ${document.getElementById('instructions').value}</p>`; } document.getElementById('reviewDetails').innerHTML=details; showScreen('review'); };

function saveDraftOrder() {
  const draft = {
    type: orderType,
    pkg: selectedPackage ? selectedPackage.name : null,
    services: selectedServices,
    text: {
      hairstyle1: document.getElementById('hairstyle1')?.value,
      hairstyle2: document.getElementById('hairstyle2')?.value,
      vision: document.getElementById('vision')?.value,
      instructions: document.getElementById('instructions')?.value
    },
    makeup: makeupEnabled
  };
  // Save base64 previews (will not survive reload perfectly, but good enough for draft)
  const previews = document.querySelectorAll('img[id^="preview_"]');
  draft.images = {};
  previews.forEach(img => {
    const key = img.id.replace('preview_', '');
    if (img.src && !img.src.startsWith('data:,')) {
      draft.images[key] = img.src;
    }
  });
  localStorage.setItem('pendingOrder', JSON.stringify(draft));
}

async function submitOrder(){ if (!isOnline()) { saveDraftOrder(); showToast('Order saved. We\'ll send it when you\'re back online.', true); return; } const btn=document.getElementById('submitBtn'); btn.disabled=true; btn.innerHTML='<span class="spin"></span> Uploading...'; const KEY='dbc0dad2f83bf9f24d8abad5e0afd3d1', urls={}; try{ for(let[k,f] of Object.entries(uploadedFiles)){ const fd=new FormData(); fd.append('image',f); const res=await fetch(`https://api.imgbb.com/1/upload?key=${KEY}`,{method:'POST',body:fd}); const data=await res.json(); if(!data.success) throw new Error('Upload failed'); urls[k]=data.data.url; } let msg=`Hello GIDIGBA STUDIOS!%0A%0A`; if(orderType==='photoshoot'){ msg+=`📦 ${selectedPackage.name} (GH₵ ${selectedPackage.price})%0A💇 Hairstyle: ${document.getElementById('hairstyle1')?.value||'N/A'}%0A💄 Makeup: ${makeupEnabled.person1?'Light':'None'}%0A`; for(let i=1;i<=selectedPackage.outfits;i++) msg+=`👗 Outfit ${i}: ${document.getElementById(`outfitDesc1_${i}`)?.value||'Image provided'}%0A`; if(selectedPackage.name.includes('PLATINUM')) msg+=`🌆 Background: ${document.getElementById('vision')?.value||'N/A'}%0A`; msg+=`%0A📸 Selfie: ${urls.selfieInput}%0A📸 Full Body: ${urls.fullInput}%0A`; if(selectedPackage.type==='couple'){ msg+=`%0A👤 Partner:%0A💇 Hairstyle: ${document.getElementById('hairstyle2')?.value||'N/A'}%0A💄 Makeup: ${makeupEnabled.person2?'Light':'None'}%0A`; for(let i=1;i<=selectedPackage.outfits;i++) msg+=`👗 Outfit ${i}: ${document.getElementById(`outfitDesc2_${i}`)?.value||'Image provided'}%0A`; msg+=`📸 Partner Selfie: ${urls.partnerSelfieInput}%0A📸 Partner Full Body: ${urls.partnerFullInput}%0A`; } for(let p=1; p<=(selectedPackage.type==='couple'?2:1); p++) for(let i=1;i<=selectedPackage.outfits;i++) if(urls[`outfitInput${p}_${i}`]) msg+=`👗 Outfit ${i} image (person ${p}): ${urls[`outfitInput${p}_${i}`]}%0A`; } else { const total=selectedServices.reduce((s,i)=>s+SERVICES[i].price,0); msg+=`✨ Custom Edit (GH₵ ${total})%0AServices: ${selectedServices.map(i=>SERVICES[i].name).join(', ')}%0A%0A📸 Image: ${urls.selfieInput}%0A`; if(urls['outfitInput1_1']) msg+=`👗 Outfit image: ${urls['outfitInput1_1']}%0A`; if(document.getElementById('hairstyle1')?.value) msg+=`💇 Hairstyle: ${document.getElementById('hairstyle1').value}%0A`; if(makeupEnabled.person1) msg+=`💄 Makeup: Light%0A`; if(document.getElementById('vision')?.value) msg+=`🌆 Background: ${document.getElementById('vision').value}%0A`; if(document.getElementById('instructions')?.value) msg+=`📝 Instructions: ${document.getElementById('instructions').value}%0A`; } msg+=`%0A✅ I've reviewed and will complete payment.`; window.open(`https://wa.me/233534317611?text=${msg}`,'_blank'); showToast('Order sent!',true); }catch(e){ showToast('Upload failed',false); } finally{ btn.disabled=false; btn.innerHTML='<i class="fab fa-whatsapp"></i> Send via WhatsApp'; } }
function showToast(m,g=true){ const t=document.getElementById('toast'); t.textContent=m; t.style.background=g?'#C0F500':'#ff4444'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }

// Feedback Carousel
function initFeedbackCarousel() {
  const track = document.getElementById('feedbackTrack');
  const dotsContainer = document.getElementById('feedbackDots');
  if (!track) return;
  const slides = track.querySelectorAll('.feedback-slide');
  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'feedback-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    dotsContainer.appendChild(dot);
  });
  track.addEventListener('scroll', () => {
    const scrollPos = track.scrollLeft;
    slides.forEach((slide, i) => {
      const dot = dotsContainer.children[i];
      if (dot) dot.classList.toggle('active', Math.abs(scrollPos - slide.offsetLeft) < 50);
    });
  });
}

window.onload = function() {
  loadDraft();
  if (selectedPackage) document.getElementById('continuePkgBtn').disabled = false;
  setPkgType(currentPkgType);
  initFeedbackCarousel();

  if (localStorage.getItem('pendingOrder')) {
    showToast('You have a pending order. Complete it when ready.', true);
  }
};

window.addEventListener('online', () => {
  if (localStorage.getItem('pendingOrder')) {
    showToast('You are back online! Tap to send your pending order.', true);
  }
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBar').classList.add('show');
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      document.getElementById('installBar').classList.remove('show');
    }
    deferredPrompt = null;
  }
});

window.addEventListener('appinstalled', () => {
  document.getElementById('installBar').classList.remove('show');
});