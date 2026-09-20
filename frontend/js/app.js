




function savePopularUnitsCMS() {
  var u1 = {
    badge: (document.getElementById("cms-u1-badge") ? document.getElementById("cms-u1-badge").value : "").trim(),
    title: (document.getElementById("cms-u1-title") ? document.getElementById("cms-u1-title").value : "").trim(),
    desc: (document.getElementById("cms-u1-desc") ? document.getElementById("cms-u1-desc").value : "").trim(),
    mediaUrl: (document.getElementById("cms-u1-media") ? document.getElementById("cms-u1-media").value : "").trim(),
    price: Number(document.getElementById("cms-u1-price") ? document.getElementById("cms-u1-price").value : 3000000)
  };
  var u2 = {
    badge: (document.getElementById("cms-u2-badge") ? document.getElementById("cms-u2-badge").value : "").trim(),
    title: (document.getElementById("cms-u2-title") ? document.getElementById("cms-u2-title").value : "").trim(),
    desc: (document.getElementById("cms-u2-desc") ? document.getElementById("cms-u2-desc").value : "").trim(),
    mediaUrl: (document.getElementById("cms-u2-media") ? document.getElementById("cms-u2-media").value : "").trim(),
    price: Number(document.getElementById("cms-u2-price") ? document.getElementById("cms-u2-price").value : 4200000)
  };
  var u3 = {
    badge: (document.getElementById("cms-u3-badge") ? document.getElementById("cms-u3-badge").value : "").trim(),
    title: (document.getElementById("cms-u3-title") ? document.getElementById("cms-u3-title").value : "").trim(),
    desc: (document.getElementById("cms-u3-desc") ? document.getElementById("cms-u3-desc").value : "").trim(),
    mediaUrl: (document.getElementById("cms-u3-media") ? document.getElementById("cms-u3-media").value : "").trim(),
    price: Number(document.getElementById("cms-u3-price") ? document.getElementById("cms-u3-price").value : 5000000)
  };

  var payload = { u1: u1, u2: u2, u3: u3 };
  localStorage.setItem("KUSUMA_POPULAR_UNITS_CMS", JSON.stringify(payload));
  alert("Konten unit berhasil disimpan!");
}
