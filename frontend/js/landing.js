// 2. Muat Katalog 3 Unit Populer Lengkap dengan Media Foto/Video
function initDynamicUnits() {
  var target = null;
  var els = document.querySelectorAll('*');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.children.length === 0 && el.textContent && el.textContent.trim().indexOf('Memuat katalog unit siap huni') !== -1) {
      target = el.parentElement || el;
      break;
    }
  }

  if (!target) {
    target = document.getElementById('dynamic-unit-catalog') || document.getElementById('popular-units-grid');
  }
  if (!target) return;

  var defaultUnits = [
    {
      badge: 'Single / Eksekutif',
      title: 'Studio Deluxe',
      desc: 'Luas 21 m² • Full Furnished • AC, Spring Bed, Kitchen Set, Smart TV.',
      price: 3000000,
      mediaUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    },
    {
      badge: 'Paling Favorit',
      title: '2 Bedroom Standard',
      desc: 'Luas 33 m² • 2 Kamar Tidur • Living Room, Dapur Lengkap, Balkon.',
      price: 4200000,
      mediaUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    },
    {
      badge: 'Green Palace',
      title: '3 Bedroom',
      desc: 'Akses Kolam Renang Tematik • Gym Indoor • Interior Modern+ ev charger',
      price: 4000000,
      mediaUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    }
  ];

  var units = defaultUnits;
  // BACA DUA KUNCI LOCALSTORAGE AGAR KOMPATIBEL DENGAN DASHBOARD MAUPUN ADMIN
  var rawCMS = localStorage.getItem('kp_popular_units_data') || localStorage.getItem('KUSUMA_POPULAR_UNITS_CMS');
  
  if (rawCMS) {
    try {
      var d = JSON.parse(rawCMS);
      units = defaultUnits.map(function(def, idx) {
        var u = d['u' + (idx + 1)];
        if (!u) return def;

        // PENGECEKAN AMAN: BISA MEMBACA 'media' ATAU 'mediaUrl'
        var inputMedia = u.media || u.mediaUrl;
        var validMedia = (inputMedia && inputMedia.trim().length > 5) ? inputMedia.trim() : def.mediaUrl;

        return {
          badge: (u.badge && u.badge.trim() !== '') ? u.badge.trim() : def.badge,
          title: (u.title || u.nama) ? (u.title || u.nama).trim() : def.title,
          desc: (u.desc || u.deskripsi) ? (u.desc || u.deskripsi).trim() : def.desc,
          price: (u.price !== undefined && u.price !== '') ? Number(u.price) : (u.tarif ? Number(u.tarif) : def.price),
          mediaUrl: validMedia
        };
      });
    } catch (e) {
      units = defaultUnits;
    }
  }

  target.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8';
  target.innerHTML = units.map(function(u, idx) {
    var rawMedia = u.mediaUrl;
    var isVideo = rawMedia.indexOf('data:video') === 0 || rawMedia.endsWith('.mp4') || rawMedia.endsWith('.webm');
    
    var mediaHtml = '';
    if (isVideo) {
      mediaHtml = '<div class="w-full h-48 rounded-2xl overflow-hidden mb-4 relative bg-black">' +
        '<video src="' + rawMedia + '" autoplay muted loop playsinline class="w-full h-full object-cover"></video>' +
        '<span class="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] font-bold">VIDEO TOUR</span></div>';
    } else {
      mediaHtml = '<div class="w-full h-48 rounded-2xl overflow-hidden mb-4 relative bg-[#F4EFE6]">' +
        '<img src="' + rawMedia + '" alt="' + u.title + '" loading="lazy" class="w-full h-full object-cover transition duration-500 hover:scale-105">' +
        '<span class="absolute top-2 right-2 px-2.5 py-1 bg-[#2C2C2A]/70 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase">FOTO ASLI</span></div>';
    }

    return '<div class="japandi-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-3 bg-white/90 border border-[#E8DFD3] shadow-sm hover:shadow-md transition">' +
      '<div>' +
        mediaHtml +
        '<div class="space-y-1.5">' +
          '<span class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F4EFE6] text-[#8C5835] border border-[#DDD3C2]">' + u.badge + '</span>' +
          '<h4 class="text-lg font-bold text-[#2C2C2A]">' + u.title + '</h4>' +
          '<p class="text-xs text-[#737370] leading-relaxed">' + u.desc + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="pt-3 border-t border-[#E8DFD3] flex items-center justify-between">' +
        '<div>' +
          '<span class="text-[10px] text-[#737370] uppercase">Mulai Dari</span>' +
          '<p class="text-base font-bold font-mono text-[#8C5835]">Rp ' + Number(u.price).toLocaleString('id-ID') + '<span class="text-xs font-normal text-[#737370]">/bln</span></p>' +
        '</div>' +
        '<button onclick="handleInquireUnit(event, \'' + u.title + '\')" class="px-4 py-2 bg-[#8C5835] hover:bg-[#704326] text-white text-xs font-bold rounded-xl shadow-sm transition">Tanya Unit</button>' +
      '</div>' +
    '</div>';
  }).join('');
}
