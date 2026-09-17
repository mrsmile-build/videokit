// js/kinetic.js - Brand Motion renderer (word-by-word kinetic typography)
const VK_BRAND = {
  palette: ['#f2f5f9', '#2447f0', '#0b0b4d'],
  fg: '#ffffff',
  ghost: 'rgba(255,255,255,0.25)',
  ghostDark: 'rgba(10,10,60,0.18)',
  accent: '#ffffff'
};

function _kinWrap(words, perLine) {
  const lines = [];
  for (let i = 0; i < words.length; i += perLine) lines.push(words.slice(i, i + perLine));
  return lines;
}

function _kinScenePlan(scene) {
  const raw = (scene.narration || '').trim();
  let words = (scene.isCta ? raw : raw.split(/\s+/).slice(0, 14)).filter(Boolean);
  if (scene.isHookFrame) words = words.map(w => w.toUpperCase());
  return { words: words, lines: _kinWrap(words, scene.isHookFrame ? 3 : 4) };
}

async function renderKineticVideo(scenes, audioBlob, brand, opts) {
  opts = opts || {};
  const B = Object.assign({}, VK_BRAND, brand || {});
  const W = 720, H = 1280, FPS = 30;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const target = (opts.totalLen || 60) + 0.4;
  const charCounts = scenes.map(s => Math.max((s.narration || '').length, 10));
  const totalChars = charCounts.reduce((a, b) => a + b, 0) || 1;
  let run = 0;
  const durations = charCounts.map((cnt, i) => {
    if (i === charCounts.length - 1) return Math.max(2, Math.round((target - run) * 10) / 10);
    const d = Math.max(2, Math.round((cnt / totalChars) * target));
    run += d; return d;
  });
  const total = durations.reduce((a, b) => a + b, 0);

  let audioEl = null, musicEl = null, actx = null, dest = null;
  if (audioBlob || opts.musicUrl) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    dest = actx.createMediaStreamDestination();
    if (audioBlob) {
      audioEl = new Audio(URL.createObjectURL(audioBlob));
      actx.createMediaElementSource(audioEl).connect(dest);
    }
    if (opts.musicUrl) {
      musicEl = new Audio(opts.musicUrl);
      musicEl.crossOrigin = 'anonymous';
      const g = actx.createGain(); g.gain.value = 0.25;
      actx.createMediaElementSource(musicEl).connect(g); g.connect(dest);
    }
  }

  const stream = canvas.captureStream(FPS);
  if (dest) dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
    : (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm');
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 });
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

  const plans = scenes.map(s => _kinScenePlan(s));

  function drawScene(i, tIn) {
    const s = scenes[i];
    const D = durations[i];
    const bg = s.isHookFrame ? B.palette[1] : B.palette[i % B.palette.length];
    const dark = (i % B.palette.length) === 0;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const ghost = dark ? B.ghostDark : B.ghost;
    const plan = plans[i];
    const lineH = s.isHookFrame ? 150 : 120;
    const size = s.isHookFrame ? 92 : (plan.lines.length > 3 ? 62 : 78);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    if (s.isCta && opts.ctaUrl) {
      ctx.font = '700 44px Syne, sans-serif';
      const tw = ctx.measureText(opts.ctaUrl).width;
      const pw = tw + 90, ph = 96, px = (W - pw) / 2, py = H / 2 - ph / 2;
      ctx.fillStyle = dark ? 'rgba(10,10,60,0.85)' : 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 48); else ctx.rect(px, py, pw, ph);
      ctx.fill();
      ctx.fillStyle = dark ? B.palette[1] : '#ffffff';
      ctx.fillText(opts.ctaUrl, px + 45, H / 2 + 4);
      ctx.font = '700 38px Syne, sans-serif';
      ctx.fillStyle = ghost;
      ctx.textAlign = 'center';
      ctx.fillText((s.narration || '').slice(0, 42), W / 2, H / 2 - 150);
      ctx.textAlign = 'left';
    } else {
      const totalWords = plan.words.length || 1;
      const revealSpan = D * 0.75;
      let y = H / 2 - ((plan.lines.length - 1) * lineH) / 2;
      let wIdx = 0;
      for (const line of plan.lines) {
        ctx.font = '800 ' + size + 'px Syne, sans-serif';
        const widths = line.map(w => ctx.measureText(w).width);
        const spaceW = ctx.measureText(' ').width;
        const lineW = widths.reduce((a, b) => a + b, 0) + spaceW * (line.length - 1);
        let x = (W - lineW) / 2;
        for (let k = 0; k < line.length; k++) {
          const t = (wIdx / totalWords) * revealSpan;
          ctx.fillStyle = (tIn >= t) ? (s.isHookFrame ? B.accent : B.fg) : ghost;
          ctx.fillText(line[k], x, y);
          x += widths[k] + spaceW;
          wIdx++;
        }
        y += lineH;
      }
    }
    ctx.font = '700 26px Syne, sans-serif';
    ctx.fillStyle = dark ? 'rgba(10,10,60,0.5)' : 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('VideoKit', W - 24, H - 28);
    ctx.textAlign = 'left';
  }

  return new Promise((resolve) => {
    rec.start(500);
    if (audioEl) audioEl.play().catch(() => {});
    if (musicEl) musicEl.play().catch(() => {});
    const t0 = performance.now();
    function frame() {
      const el = (performance.now() - t0) / 1000;
      let acc = 0, idx = durations.length - 1, tIn = 0;
      for (let i = 0; i < durations.length; i++) {
        if (el < acc + durations[i]) { idx = i; tIn = el - acc; break; }
        acc += durations[i];
      }
      drawScene(idx, tIn);
      if (el >= total) {
        rec.stop();
        if (audioEl) audioEl.pause();
        if (musicEl) musicEl.pause();
        rec.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
