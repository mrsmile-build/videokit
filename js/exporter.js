window._vkExt = 'webm';
async function vkConvIfAny(blob) {
  window._vkExt = 'webm';
  if (!blob || !blob.type || blob.type.indexOf('webm') === -1 || !window.smartFetch) return blob;
  var isNet = function(m){ return /fetch|abort|network|Status 5|All backends|timeout/i.test(m || ''); };
  var b64 = await new Promise(function(res, rej){ var rd = new FileReader(); rd.onload = function(){ res(rd.result); }; rd.onerror = rej; rd.readAsDataURL(blob); });
  var jobId = null, lastErr = null;
  for (var a = 1; a <= 3 && !jobId; a++) {
    try {
      if (window.addMsg) addMsg('ai', 'Converting to MP4 (try ' + a + '/3)...');
      if (a === 1) {
        try { await smartFetch('/').catch(function(){}); await new Promise(function(r){setTimeout(r,2000);}); } catch(e){}
      }
      var ctrl = new AbortController();
      var tmr = setTimeout(function(){ ctrl.abort(); }, a === 1 ? 60000 : 45000);
      var r;
      try { r = await smartFetch('/remux-start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ webmBase64: b64 }), signal: ctrl.signal }); }
      finally { clearTimeout(tmr); }
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok && d.jobId) { jobId = d.jobId; break; }
      throw new Error((d && d.error) || ('remux HTTP ' + r.status));
    } catch (e) {
      lastErr = e;
      if (!isNet(e.message) || a === 3) break;
      await new Promise(function(rr){ setTimeout(rr, 6000); });
    }
  }
  if (!jobId) {
    if (window.addMsg) addMsg('ai', 'MP4 conversion skipped: ' + (lastErr && lastErr.message) + ' - saved WebM (still plays fine)');
    return blob;
  }
  var pollNet = 0;
  for (var i = 0; i < 180; i++) {
    await new Promise(function(rr){ setTimeout(rr, 3000); });
    if (i === 90 && window.addMsg) addMsg('ai', 'Still converting - your batch is lined up on one server; keep this tab open, it is working.');
    var st;
    try { st = await smartFetch('/merge-status/' + jobId); }
    catch (pe) {
      pollNet++;
      if (pollNet <= 5) continue;
      if (window.addMsg) addMsg('ai', 'MP4 conversion skipped: link lost during encode - saved WebM (still plays fine)');
      return blob;
    }
    var ct = (st.headers.get('content-type') || '');
    if (st.ok && ct.indexOf('video') !== -1) {
      var out = await st.blob();
      window._vkExt = 'mp4';
      if (window.addMsg) addMsg('ai', 'MP4 ready (' + (out.size/1048576).toFixed(1) + 'MB) - gallery shows real duration now');
      return out;
    }
    var j = await st.json().catch(function(){ return null; });
    if (j && j.status === 'error') {
      if (window.addMsg) addMsg('ai', 'MP4 conversion skipped: ' + (j.error || 'remux error') + ' - saved WebM (still plays fine)');
      return blob;
    }
  }
  if (window.addMsg) addMsg('ai', 'MP4 conversion skipped: this batch outlasted the 9-minute window on one server (queued behind other videos) - saved WebM (still plays fine). Tip: retry it when fewer are rendering, or export it as a single.');
  return blob;
}
