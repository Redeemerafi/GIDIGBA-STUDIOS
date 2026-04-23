const state = {
  screen: 'home',
  mode: 'photoshoot',
  packageType: 'individual',
  packageTier: 'silver',
  selectedService: null,
  uploadData: {},
};

const screens = document.querySelectorAll('.screen');
const toggleButtons = document.querySelectorAll('.toggle-button');
const packageButtons = document.querySelectorAll('[data-action="select-package"]');
const serviceCarousel = document.getElementById('serviceCarousel');
const serviceSelectButton = document.getElementById('serviceSelectButton');
const uploadFields = document.getElementById('uploadFields');
const continueReview = document.getElementById('continueReview');
const orderSummary = document.getElementById('orderSummary');
const sendWhatsApp = document.getElementById('sendWhatsApp');

const services = [
  { id: 'basic-retouch', title: 'Basic Photo Retouch', price: 30, description: 'Clean and refine your photo for a polished finish.' },
  { id: 'advanced-retouch', title: 'Advanced Retouch', price: 50, description: 'Full tone, skin and detail refinement.' },
  { id: 'outfit-change', title: 'Outfit Change', price: 15, description: 'Swap or update clothing style in your photo.' },
  { id: 'hairstyle-change', title: 'Hairstyle Change', price: 15, description: 'New hairstyle or styling enhancement.' },
  { id: 'makeup-application', title: 'Makeup Application', price: 20, description: 'Beauty makeup for a refreshed, camera-ready look.' },
  { id: 'pose-adjustment', title: 'Pose Adjustment / Correction', price: 10, description: 'Improve the angle and pose of your shot.' },
  { id: 'background-change', title: 'Background Change / Replacement', price: 10, description: 'Swap the scene behind your photo.' },
  { id: 'combine-two-people', title: 'Two People Combined into One Image', price: 50, description: 'Merge two images into one cohesive composition.' },
  { id: 'object-removal', title: 'Object or Person Removal', price: 20, description: 'Remove unwanted elements cleanly.' },
  { id: 'scene-replacement', title: 'Full Scene Replacement', price: 50, description: 'Replace the full environment with a new scene.' },
  { id: 'illustration', title: 'Photo-to-Illustration / Cartoon Style', price: 40, description: 'Stylized illustration or cartoon treatment.' },
  { id: 'environment-enhancement', title: 'Environmental Enhancement', price: 30, description: 'Enhance sky, nature, or studio lighting.' },
  { id: 'mood-pack', title: 'Mood / Filter Pack Application', price: 20, description: 'Apply cinematic filters and color tones.' },
  { id: 'pet-addition', title: 'Single Object / Pet Addition', price: 20, description: 'Add one object or pet into your photo.' },
  { id: 'restoration', title: 'Photo Restoration', price: 50, description: 'Repair old, damaged, or faded images.' },
  { id: 'mirror-effect', title: 'Mirror / Reflection Effect', price: 25, description: 'Add mirror or reflection styling to your image.' },
];

function showScreen(screenName) {
  state.screen = screenName;
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.dataset.screen === screenName);
  });

  if (screenName === 'packages') {
    state.mode = 'photoshoot';
  }

  if (screenName === 'custom') {
    state.mode = 'custom';
  }

  if (screenName === 'upload') {
    renderUploadFields();
  }

  if (screenName === 'review') {
    renderReview();
  }
}

function setActivePackageType(type) {
  state.packageType = type;
  toggleButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.option === type);
  });
  renderPackageCards();
}

function renderPackageCards() {
  const isCouple = state.packageType === 'couple';
  const tierDetails = {
    silver: isCouple ? '1 outfit per person · 3 images · Studio layout' : '1 outfit · 3 photos · Basic editing',
    gold: isCouple ? '2 outfits per person · 4 images · Creative scene' : '2 outfits · 6 photos · Premium editing',
    platinum: isCouple ? '3 outfits per person · 6 images · Premium concepts' : '3 outfits · 9 photos · Custom background + priority',
  };
  const priceLabels = { silver: isCouple ? 'GH₵120' : 'GH₵55', gold: isCouple ? 'GH₵230' : 'GH₵100', platinum: isCouple ? 'GH₵350' : 'GH₵150' };
  document.querySelectorAll('.package-card').forEach((card) => {
    const tier = card.dataset.package;
    card.querySelector('p:nth-of-type(1)').textContent = priceLabels[tier];
    card.querySelector('p:nth-of-type(2)').textContent = tierDetails[tier];
  });
}

function selectPackage(tier) {
  state.packageTier = tier;
  state.selectedService = null;
  showScreen('upload');
}

function renderServices() {
  serviceCarousel.innerHTML = '';
  services.forEach((service) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'service-card';
    card.dataset.service = service.id;
    card.innerHTML = `
      <h4>${service.title}</h4>
      <p>${service.description}</p>
      <span class="service-price">GH₵${service.price}</span>
    `;
    card.addEventListener('click', () => selectService(service.id));
    serviceCarousel.appendChild(card);
  });
  setActiveService(services[0].id);
}

function setActiveService(serviceId) {
  state.selectedService = serviceId;
  document.querySelectorAll('.service-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.service === serviceId);
  });
}

function selectService(serviceId) {
  setActiveService(serviceId);
}

function renderUploadFields() {
  uploadFields.innerHTML = '';
  const sectionTitle = document.createElement('h3');
  sectionTitle.textContent = state.mode === 'custom' ? 'Custom edit details' : 'Photoshoot details';
  uploadFields.appendChild(sectionTitle);

  if (state.mode === 'photoshoot') {
    const isCouple = state.packageType === 'couple';
    uploadFields.appendChild(createFileField('selfie', 'Selfie (required)'));
    uploadFields.appendChild(createFileField('fullbody', 'Full body photo (required)'));
    uploadFields.appendChild(createTextField('hairstyle', 'Hairstyle description (required)', 'Describe your hairstyle or look.'));
    uploadFields.appendChild(createCheckboxField('makeup', 'Light makeup requested'));
    uploadFields.appendChild(createTextField('outfit', `Outfit details${state.packageTier === 'platinum' ? ' (3 outfits expected)' : ''}`, 'Describe your outfit(s) or upload the outfit details.'));
    if (state.packageTier === 'platinum') {
      uploadFields.appendChild(createTextField('vision', 'Optional vision note', 'Add any additional background / style requests.'));
    }
    if (isCouple) {
      uploadFields.appendChild(createDivider('Couple details: Person 2'));
      uploadFields.appendChild(createFileField('selfie2', 'Person 2 selfie (required)'));
      uploadFields.appendChild(createFileField('fullbody2', 'Person 2 full body photo (required)'));
      uploadFields.appendChild(createTextField('hairstyle2', 'Person 2 hairstyle description (required)', 'Describe the second person’s hairstyle.'));
      uploadFields.appendChild(createTextField('outfit2', 'Person 2 outfit details', 'Describe the second person’s outfit(s).'));
    }
  } else {
    uploadFields.appendChild(createFileField('baseImage', 'Base image (required)'));
    uploadFields.appendChild(createTextField('editVision', 'Edit description', 'Describe what you want changed in the image.'));
    const service = services.find((item) => item.id === state.selectedService) || services[0];
    uploadFields.appendChild(createTextField('selectedService', 'Selected service', '', true, service.title));
    if (['outfit-change', 'hairstyle-change', 'background-change', 'scene-replacement'].includes(state.selectedService)) {
      uploadFields.appendChild(createTextField('serviceDetails', 'Describe your request in detail', 'The more detail, the better.'));
    }
  }
}

function createTextField(id, label, placeholder, readOnly = false, value = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  const fieldLabel = document.createElement('label');
  fieldLabel.htmlFor = id;
  fieldLabel.textContent = label;
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.readOnly = readOnly;
  input.value = value;
  wrapper.append(fieldLabel, input);
  return wrapper;
}

function createFileField(id, label) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  const fieldLabel = document.createElement('label');
  fieldLabel.htmlFor = id;
  fieldLabel.textContent = label;
  const input = document.createElement('input');
  input.type = 'file';
  input.id = id;
  input.name = id;
  wrapper.append(fieldLabel, input);
  return wrapper;
}

function createCheckboxField(id, label) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.name = id;
  wrapper.append(labelEl, input);
  return wrapper;
}

function createDivider(text) {
  const divider = document.createElement('div');
  divider.className = 'section-head';
  divider.innerHTML = `<h3>${text}</h3>`;
  return divider;
}

function renderReview() {
  const customerName = document.getElementById('customerName').value.trim();
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const visionText = document.getElementById('visionText').value.trim();
  const summaryItems = [];
  if (!customerName || !customerPhone) {
    alert('Please provide your name and WhatsApp number before continuing.');
    showScreen('upload');
    return;
  }

  summaryItems.push(`<p><strong>Name:</strong> ${customerName}</p>`);
  summaryItems.push(`<p><strong>WhatsApp:</strong> ${customerPhone}</p>`);
  if (state.mode === 'photoshoot') {
    summaryItems.push(`<p><strong>Service:</strong> ${state.packageType === 'couple' ? 'Couple photoshoot' : 'Individual photoshoot'}</p>`);
    summaryItems.push(`<p><strong>Package:</strong> ${state.packageTier.charAt(0).toUpperCase() + state.packageTier.slice(1)}</p>`);
  } else {
    const service = services.find((item) => item.id === state.selectedService) || services[0];
    summaryItems.push(`<p><strong>Service:</strong> Custom edit</p>`);
    summaryItems.push(`<p><strong>Selected option:</strong> ${service.title}</p>`);
    summaryItems.push(`<p><strong>Price:</strong> GH₵${service.price}</p>`);
  }
  if (visionText) {
    summaryItems.push(`<p><strong>Vision:</strong> ${visionText}</p>`);
  }
  summaryItems.push('<p><strong>Important:</strong> After sending this message, please attach your images in WhatsApp or confirm them in chat.</p>');
  orderSummary.innerHTML = summaryItems.join('');
}

function collectFormData() {
  const fields = Array.from(document.querySelectorAll('#uploadForm input, #uploadForm textarea'));
  const data = {};
  fields.forEach((field) => {
    if (field.type === 'checkbox') {
      data[field.name] = field.checked;
    } else if (field.type === 'file') {
      data[field.name] = field.files.length ? field.files[0].name : '';
    } else {
      data[field.name] = field.value.trim();
    }
  });
  state.uploadData = data;
  return data;
}

function uploadFiles() {
  const formData = new FormData();
  const fileInputs = Array.from(document.querySelectorAll('#uploadForm input[type="file"]'));
  fileInputs.forEach((input) => {
    if (input.files.length) {
      formData.append(input.name, input.files[0]);
    }
  });
  if ([...formData].length === 0) {
    return Promise.resolve({});
  }
  return fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    })
    .then((result) => {
      if (!result.success) {
        throw new Error(result.error || 'Upload error');
      }
      return result.uploaded;
    });
}

function setLoading(isLoading, button, loadingText) {
  if (!button) return;
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText || 'Processing...' : button.dataset.originalText;
}

function fileReference(name) {
  return state.uploadData.uploadedUrls?.[name] || state.uploadData[name] || '(attached in chat)';
}

function buildWhatsAppMessage() {
  const data = state.uploadData;
  const lines = [];
  lines.push('GIDIGBA STUDIOS order request:');
  lines.push(`Name: ${data.customerName || ''}`);
  lines.push(`WhatsApp: ${data.customerPhone || ''}`);
  if (state.mode === 'photoshoot') {
    lines.push(`Service: ${state.packageType === 'couple' ? 'Couple photoshoot' : 'Individual photoshoot'}`);
    lines.push(`Package: ${state.packageTier.charAt(0).toUpperCase() + state.packageTier.slice(1)}`);
    lines.push(`Selfie: ${fileReference('selfie')}`);
    lines.push(`Full body: ${fileReference('fullbody')}`);
    lines.push(`Hairstyle: ${data.hairstyle || ''}`);
    lines.push(`Outfit: ${data.outfit || ''}`);
    if (data.makeup) lines.push('Light makeup: Yes');
    if (data.vision) lines.push(`Vision: ${data.vision}`);
    if (state.packageType === 'couple') {
      lines.push('--- Person 2 ---');
      lines.push(`Selfie 2: ${fileReference('selfie2')}`);
      lines.push(`Full body 2: ${fileReference('fullbody2')}`);
      lines.push(`Hairstyle 2: ${data.hairstyle2 || ''}`);
      lines.push(`Outfit 2: ${data.outfit2 || ''}`);
    }
  } else {
    const service = services.find((item) => item.id === state.selectedService) || services[0];
    lines.push('Service: Custom edit');
    lines.push(`Option: ${service.title}`);
    lines.push(`Base image: ${fileReference('baseImage')}`);
    lines.push(`Request details: ${data.editVision || ''}`);
    if (data.serviceDetails) lines.push(`Service detail: ${data.serviceDetails}`);
  }
  lines.push('Images will be shared directly in WhatsApp after this message.');
  return encodeURIComponent(lines.join('\n'));
}

screens.forEach((screen) => {
  screen.querySelectorAll('[data-action="go"]').forEach((button) => {
    button.addEventListener('click', () => showScreen(button.dataset.screen));
  });
});

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => setActivePackageType(button.dataset.option));
});

packageButtons.forEach((button) => {
  button.addEventListener('click', () => selectPackage(button.dataset.package));
});

serviceSelectButton.addEventListener('click', () => {
  if (!state.selectedService) {
    alert('Choose a custom service first.');
    return;
  }
  showScreen('upload');
});

continueReview.addEventListener('click', async () => {
  collectFormData();
  setLoading(true, continueReview, 'Uploading...');
  try {
    const uploadedUrls = await uploadFiles();
    state.uploadData.uploadedUrls = uploadedUrls;
    showScreen('review');
  } catch (error) {
    console.error(error);
    alert('Unable to upload images. Please try again or check that the local backend is running.');
  } finally {
    setLoading(false, continueReview);
  }
});

sendWhatsApp.addEventListener('click', async () => {
  collectFormData();
  if (!state.uploadData.uploadedUrls) {
    setLoading(true, sendWhatsApp, 'Uploading...');
    try {
      const uploadedUrls = await uploadFiles();
      state.uploadData.uploadedUrls = uploadedUrls;
    } catch (error) {
      console.error(error);
      alert('Unable to upload images before sending.');
      setLoading(false, sendWhatsApp);
      return;
    } finally {
      setLoading(false, sendWhatsApp);
    }
  }
  const message = buildWhatsAppMessage();
  window.open(`https://wa.me/233534317611?text=${message}`, '_blank');
});

renderServices();
setActivePackageType('individual');
renderPackageCards();
