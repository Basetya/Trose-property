

// Handler Unggah Berkas Langsung (Foto / Video ke Base64 DataURL)
function handleDirectMediaUpload(event, idx) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    alert("Ukuran berkas maksimal 8 MB agar website tetap cepat.");
    event.target.value = "";
    return;
  }
  var stat = document.getElementById("cms-u" + idx + "-status");
  var input = document.getElementById("cms-u" + idx + "-media");
  var prev = document.getElementById("cms-u" + idx + "-preview");
  if (stat) stat.innerText = "Memproses: " + file.name;
  var reader = new FileReader();
  reader.onload = function(e) {
    var dataUrl = e.target.result;
    if (input) input.value = dataUrl;
    if (stat) stat.innerText = "✅ " + file.name;
    if (prev) {
      prev.classList.remove("hidden");
      if (file.type.indexOf("video") === 0) {
        prev.innerHTML = '<video src="' + dataUrl + '" class="w-full h-full object-cover" autoplay muted loop></video>';
      } else {
        prev.innerHTML = '<img src="' + dataUrl + '" class="w-full h-full object-cover">';
      }
    }
  };
  reader.readAsDataURL(file);
}
