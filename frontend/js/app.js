function savePopularUnitsCMS() {
  function getVal(ids, fallback) {
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.value !== undefined && el.value.trim() !== '') {
        return el.value.trim();
      }
    }
    return fallback;
  }

  var u1 = {
    badge: getVal(['cms-u1-badge', 'u1-badge'], 'Single / Eksekutif'),
    title: getVal(['cms-u1-title', 'cms-u1-name', 'u1-title', 'u1-name'], 'Studio Deluxe'),
    desc: getVal(['cms-u1-desc', 'u1-desc'], 'Luas 21 m² • Full Furnished • AC, Spring Bed, Kitchen Set, Smart TV.'),
    mediaUrl: getVal(['cms-u1-media', 'u1-media'], ''),
    price: Number(getVal(['cms-u1-price', 'u1-price'], 3000000)) || 3000000
  };

  var u2 = {
    badge: getVal(['cms-u2-badge', 'u2-badge'], 'Paling Favorit'),
    title: getVal(['cms-u2-title', 'cms-u2-name', 'u2-title', 'u2-name'], '2 Bedroom Standard'),
    desc: getVal(['cms-u2-desc', 'u2-desc'], 'Luas 33 m² • 2 Kamar Tidur • Living Room, Dapur Lengkap, Balkon.'),
    mediaUrl: getVal(['cms-u2-media', 'u2-media'], ''),
    price: Number(getVal(['cms-u2-price', 'u2-price'], 4200000)) || 4200000
  };

  var u3 = {
    badge: getVal(['cms-u3-badge', 'u3-badge'], 'Green Palace'),
    title: getVal(['cms-u3-title', 'cms-u3-name', 'u3-title', 'u3-name'], '3 Bedroom'),
    desc: getVal(['cms-u3-desc', 'u3-desc'], 'Akses Kolam Renang Tematik • Gym Indoor • Interior Modern+ ev charger'),
    mediaUrl: getVal(['cms-u3-media', 'u3-media'], ''),
    price: Number(getVal(['cms-u3-price', 'u3-price'], 4000000)) || 4000000
  };

  var payload = { u1: u1, u2: u2, u3: u3 };
  localStorage.setItem('KUSUMA_POPULAR_UNITS_CMS', JSON.stringify(payload));
  alert('✅ Konten unit berhasil disimpan dan disinkronkan ke Landing Page!');
}