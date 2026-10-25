window._vkExt = 'webm';
async function vkConvIfAny(blob) {
  window._vkExt = 'webm';
  if (!blob || !blob.type || !blob.type.includes('webm') || !window.smartFetch) return blob;
  try {
    if (window.addMsg) addMsg('ai', 'Converting to MP4 so platforms accept it...');
    const b64 = await new Promise(function(res, rej){ var rd = new FileReader(); rd.onload = function(){ res(rd.result); }; rd.onerror = rej; rd.readAsDataURL(blob); });
    const r = await smartFetch('/remux-start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ webmBase64: b64 }) });
    const d = await r.json();
    if (!r.ok || !d.jobId) throw new Error((d && d.error) || 'remux rejected');
    for (var i = 0; i < 100; i++) {
      await new Promise(function(rr){ setTimeout(rr, 3000); });
      const st = await smartFetch('/merge-status/' + d.jobId);
      const ct = (st.headers.get('content-type') || '');
      if (st.ok && ct.includes('video')) {
        const out = await st.blob();
        window._vkExt = 'mp4';
        if (window.addMsg) addMsg('ai', 'MP4 ready (' + (out.size/1048576).toFixed(1) + 'MB) - gallery shows real duration now');
        return out;
      }
      const j = await st.json().catch(function(){ return null; });
      if (j && j.status === 'error') throw new Error(j.error || 'remux error');
    }
    throw new Error('remux timeout');
  } catch (e) {
    if (window.addMsg) addMsg('ai', 'MP4 conversion skipped: ' + e.message + ' - saved WebM (still plays fine)');
    window._vkExt = 'webm';
    return blob;
  }
}
