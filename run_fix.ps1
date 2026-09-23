$d = "frontend/dashboard.html"; $a = "frontend/js/app.js"; $l = "frontend/js/landing.js"
Copy-Item $d "$d.bak" -Force; Copy-Item $a "$a.bak" -Force; Copy-Item $l "$l.bak" -Force

# 1. Update dashboard.html dengan tombol upload & preview
$dash = Get-Content $d -Raw -Encoding UTF8
$btn1 = '<div class="mt-1.5 flex items-center gap-2"><label class="cursor-pointer px-3 py-1.5 bg-[#8C5835] text-white rounded-xl text-xs font-bold flex items-center gap-1"><span>📁 Pilih Berkas</span><input type="file" id="cms-u1-file" accept="image/*,video/mp4" onchange="handleDirectMediaUpload(event, 1)" class="hidden"></label><span id="cms-u1-status" class="text-[10px] text-[#737370] truncate max-w-[140px]">Belum ada berkas</span></div><div id="cms-u1-preview" class="mt-2 hidden w-full h-24 rounded-xl overflow-hidden border border-[#E8DFD3] bg-white"></div>'
$btn2 = '<div class="mt-1.5 flex items-center gap-2"><label class="cursor-pointer px-3 py-1.5 bg-[#8C5835] text-white rounded-xl text-xs font-bold flex items-center gap-1"><span>📁 Pilih Berkas</span><input type="file" id="cms-u2-file" accept="image/*,video/mp4" onchange="handleDirectMediaUpload(event, 2)" class="hidden"></label><span id="cms-u2-status" class="text-[10px] text-[#737370] truncate max-w-[140px]">Belum ada berkas</span></div><div id="cms-u2-preview" class="mt-2 hidden w-full h-24 rounded-xl overflow-hidden border border-[#E8DFD3] bg-white"></div>'
$btn3 = '<div class="mt-1.5 flex items-center gap-2"><label class="cursor-pointer px-3 py-1.5 bg-[#8C5835] text-white rounded-xl text-xs font-bold flex items-center gap-1"><span>📁 Pilih Berkas</span><input type="file" id="cms-u3-file" accept="image/*,video/mp4" onchange="handleDirectMediaUpload(event, 3)" class="hidden"></label><span id="cms-u3-status" class="text-[10px] text-[#737370] truncate max-w-[140px]">Belum ada berkas</span></div><div id="cms-u3-preview" class="mt-2 hidden w-full h-24 rounded-xl overflow-hidden border border-[#E8DFD3] bg-white"></div>'

if ($dash -notmatch 'id="cms-u1-file"') { $dash = $dash -replace '(<input[^>]*id="cms-u1-media"[^>]*>)', "`$1`n$btn1" }
if ($dash -notmatch 'id="cms-u2-file"') { $dash = $dash -replace '(<input[^>]*id="cms-u2-media"[^>]*>)', "`$1`n$btn2" }
if ($dash -notmatch 'id="cms-u3-file"') { $dash = $dash -replace '(<input[^>]*id="cms-u3-media"[^>]*>)', "`$1`n$btn3" }
[System.IO.File]::WriteAllText("$PWD/$d", $dash, [System.Text.Encoding]::UTF8)

# 2. Update app.js dengan reader Base64
$app = Get-Content $a -Raw -Encoding UTF8
$fn = "function handleDirectMediaUpload(e, idx) { var f = e.target.files[0]; if (!f) return; if (f.size > 8 * 1024 * 1024) { alert('Maksimal 8 MB'); return; } var stat = document.getElementById('cms-u' + idx + '-status'); var input = document.getElementById('cms-u' + idx + '-media'); var prev = document.getElementById('cms-u' + idx + '-preview'); if (stat) stat.innerText = 'Memproses: ' + f.name; var r = new FileReader(); r.onload = function(ev) { var res = ev.target.result; if (input) input.value = res; if (stat) stat.innerText = 'Siap: ' + f.name; if (prev) { prev.classList.remove('hidden'); prev.innerHTML = f.type.startsWith('video/') ? '<video src=\"' + res + '\" class=\"w-full h-full object-cover\" autoplay muted loop></video>' : '<img src=\"' + res + '\" class=\"w-full h-full object-cover\">'; } }; r.readAsDataURL(f); }"
if ($app -notmatch 'handleDirectMediaUpload') { $app = $app + "`n" + $fn; [System.IO.File]::WriteAllText("$PWD/$a", $app, [System.Text.Encoding]::UTF8) }

# 3. Kunci unit fallback di landing.js
$land = Get-Content$l -Raw -Encoding UTF8
$land =$land -replace 'const imgUrl = u\.mediaUrl \|\| defaultUnits\[0\]\.mediaUrl;', 'const imgUrl = (u.mediaUrl && u.mediaUrl.trim()) ? u.mediaUrl : defaultUnits[idx]?.mediaUrl || defaultUnits[0].mediaUrl;'
[System.IO.File]::WriteAllText("$PWD/$l", $land, [System.Text.Encoding]::UTF8)

# 4. Git Push
git add frontend/dashboard.html frontend/js/app.js frontend/js/landing.js
git commit -m "feat(cms): direct file upload integration (v162.0)"
git push origin main
Write-Host "SELESAI_SUKSES_v162" -ForegroundColor Green