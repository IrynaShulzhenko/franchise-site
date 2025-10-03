// Сайт розроблено студенткою Шульженко Іриною, група 5-9з, ФЕМП
// Дані: типи франшиз, міста, та базові статті витрат.
// Всі розрахунки — на клієнті, без серверної логіки.

const DATA = {
  currency: 'UAH',
  franchises: [
    {
      id: 'micro',
      name: 'Мікро (стартовий)',
      description: 'Мінімальний пакет для швидкого запуску',
      baseFee: 15000,
      breakdown: {
        rent: 20000,
        equipment: 25000,
        repair: 8000,
        marketing: 5000,
        personnel: 12000,
        buffer: 4000
      }
    },
    {
      id: 'small',
      name: 'Мала франшиза',
      description: 'Популярний пакет з базовим оснащенням',
      baseFee: 40000,
      breakdown: {
        rent: 35000,
        equipment: 60000,
        repair: 15000,
        marketing: 12000,
        personnel: 30000,
        buffer: 8000
      }
    },
    {
      id: 'medium',
      name: 'Середня франшиза',
      description: 'Розширений пакет для міського магазину/кафе',
      baseFee: 90000,
      breakdown: {
        rent: 70000,
        equipment: 120000,
        repair: 30000,
        marketing: 25000,
        personnel: 60000,
        buffer: 15000
      }
    },
    {
      id: 'large',
      name: 'Велика франшиза',
      description: 'Максимальний пакет для масштабного запуску',
      baseFee: 200000,
      breakdown: {
        rent: 150000,
        equipment: 350000,
        repair: 80000,
        marketing: 60000,
        personnel: 150000,
        buffer: 50000
      }
    }
  ],
  cities: [
    { id: 'kyiv', name: 'Київ', rentMultiplier: 1.6 },
    { id: 'lviv', name: 'Львів', rentMultiplier: 1.2 },
    { id: 'kharkiv', name: 'Харків', rentMultiplier: 1.0 },
    { id: 'odesa', name: 'Одеса', rentMultiplier: 1.25 }
  ]
};

// --- HELPERS ---
function formatMoney(n){
  return new Intl.NumberFormat('uk-UA').format(Math.round(n)) + ' ' + DATA.currency;
}

// --- UI BINDING ---
const tabs = document.querySelectorAll('.nav-btn');
const tabSections = document.querySelectorAll('.tab');
tabs.forEach(btn=>{
  btn.addEventListener('click', ()=> {
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    tabSections.forEach(s=> s.id === tab ? s.classList.add('active') : s.classList.remove('active'));
    if(tab === 'calculator') renderCalculator();
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

// Populate Types page
function renderTypes(){
  const dst = document.getElementById('franchiseList');
  dst.innerHTML = '';
  DATA.franchises.forEach(f=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${f.name}</h3>
      <p>${f.description}</p>
      <p><strong>Паушальний внесок:</strong> ${formatMoney(f.baseFee)}</p>
      <p><strong>Типова оренда (приблизно):</strong> ${formatMoney(f.breakdown.rent)}</p>
      <button data-id="${f.id}" class="select-franchise">Оберіть цей пакет</button>
    `;
    dst.appendChild(div);
  });

  document.querySelectorAll('.select-franchise').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.target.dataset.id;
      // Перейти до калькулятора та обрати тип
      document.querySelector('[data-tab="calculator"]').click();
      const select = document.getElementById('franchiseSelect');
      select.value = id;
      computeAndRender();
    });
  });
}

// Populate selects for calculator
function renderCalculator(){
  const fSelect = document.getElementById('franchiseSelect');
  const cSelect = document.getElementById('citySelect');
  if(fSelect.options.length) return; // already rendered
  DATA.franchises.forEach(f=>{
    const opt = document.createElement('option');
    opt.value = f.id; opt.textContent = `${f.name} — ${formatMoney(f.baseFee)}`;
    fSelect.appendChild(opt);
  });
  DATA.cities.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = `${c.name}`;
    cSelect.appendChild(opt);
  });

  document.getElementById('saveBtn').addEventListener('click', saveToLocal);
  document.getElementById('loadBtn').addEventListener('click', loadFromLocal);
  document.getElementById('downloadCsvBtn').addEventListener('click', downloadCsv);

  document.getElementById('franchiseSelect').addEventListener('change', computeAndRender);
  document.getElementById('citySelect').addEventListener('change', computeAndRender);

  // initial selection
  computeAndRender();
}

// Compute and render results
function computeAndRender(){
  const fId = document.getElementById('franchiseSelect').value || DATA.franchises[0].id;
  const cId = document.getElementById('citySelect').value || DATA.cities[0].id;
  const franchise = DATA.franchises.find(x=>x.id === fId);
  const city = DATA.cities.find(x=>x.id === cId);

  // Rent adjusted by city multiplier
  const rentAdjusted = Math.round(franchise.breakdown.rent * city.rentMultiplier);

  // Build detailed breakdown
  const items = [
    { key: 'Паушальний внесок', value: franchise.baseFee },
    { key: `Оренда (перший місяць, ${city.name})`, value: rentAdjusted },
    { key: 'Обладнання', value: franchise.breakdown.equipment },
    { key: 'Ремонт/облаштування', value: franchise.breakdown.repair },
    { key: 'Реклама/маркетинг', value: franchise.breakdown.marketing },
    { key: 'Персонал (перші місяці)', value: franchise.breakdown.personnel },
    { key: 'Запасний фонд', value: franchise.breakdown.buffer }
  ];

  const total = items.reduce((s,i)=>s + i.value, 0);

  // render breakdown list
  const breakdownList = document.getElementById('breakdownList');
  breakdownList.innerHTML = '';
  items.forEach(it=>{
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `<div>${it.key}</div><div>${formatMoney(it.value)}</div>`;
    breakdownList.appendChild(row);
  });

  // result details
  const details = document.getElementById('resultDetails');
  details.innerHTML = `<p>Обрано франшизу: <strong>${franchise.name}</strong> — ${franchise.description}</p>
                       <p>Місто: <strong>${city.name}</strong> (множник оренди: ${city.rentMultiplier})</p>`;

  document.getElementById('resultTotal').textContent = 'Загальна стартова сума: ' + formatMoney(total);

  // Save a small snapshot in a DOM element for CSV export
  document.getElementById('resultTotal').dataset.snapshot = JSON.stringify({ franchise: franchise.name, city: city.name, items, total });
}

// localStorage functions
function saveToLocal(){
  const data = {
    franchise: document.getElementById('franchiseSelect').value,
    city: document.getElementById('citySelect').value,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('franchise_calc', JSON.stringify(data));
  alert('Налаштування збережено в localStorage.');
}
function loadFromLocal(){
  const raw = localStorage.getItem('franchise_calc');
  if(!raw){ alert('Нічого не знайдено в localStorage.'); return; }
  try{
    const data = JSON.parse(raw);
    if(data.franchise) document.getElementById('franchiseSelect').value = data.franchise;
    if(data.city) document.getElementById('citySelect').value = data.city;
    computeAndRender();
    alert('Налаштування завантажено.');
  }catch(e){ alert('Помилка зчитування localStorage.'); }
}

// CSV download
function downloadCsv(){
  const snapRaw = document.getElementById('resultTotal').dataset.snapshot;
  if(!snapRaw){ alert('Спочатку сформуйте розрахунок.'); return; }
  const snap = JSON.parse(snapRaw);
  let csv = 'Назва статті,Сума (UAH)\n';
  snap.items.forEach(it=>{
    // escape comma in key
    const key = '"' + it.key.replace(/"/g,'""') + '"';
    csv += `${key},${it.value}\n`;
  });
  csv += `"Загальна сума",${snap.total}\n`;
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'franchise_calculation.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Contact form (demo)
document.getElementById('cfSend').addEventListener('click', ()=>{
  const name = document.getElementById('cfName').value.trim();
  const email = document.getElementById('cfEmail').value.trim();
  const msg = document.getElementById('cfMessage').value.trim();
  const status = document.getElementById('cfStatus');
  if(!name || !email || !msg){ status.textContent = 'Будь ласка, заповніть всі поля.'; return; }
  // demo behavior: save to localStorage as messages array
  const stored = JSON.parse(localStorage.getItem('contact_messages') || '[]');
  stored.push({ name, email, msg, at: new Date().toISOString() });
  localStorage.setItem('contact_messages', JSON.stringify(stored));
  status.textContent = 'Дякуємо! Повідомлення збережено локально (демо).';
  document.getElementById('cfName').value='';document.getElementById('cfEmail').value='';document.getElementById('cfMessage').value='';
});

// Initialize UI
renderTypes();
renderCalculator();
computeAndRender();
