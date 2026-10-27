// js/wc.js - WebCodecs capability probe (step 1). No behavior change yet.
window._vkWC = { v: null, a: null, ready: false };
(function(){
  function show(){
    if (location.search.indexOf('wcprobe=1') === -1) return;
    if (typeof window.addMsg !== 'function') { window.addEventListener('load', show); return; }
    addMsg('ai', 'WebCodecs probe: video=' + (window._vkWC.v || 'NONE') + ' audio=' + (window._vkWC.a || 'NONE'));
  }
  async function probe(){
    try {
      if (window.VideoEncoder) {
        var vcs = ['avc1.640028','avc1.4D401E','avc1.42E01E'];
        for (var i=0;i<vcs.length;i++){
          var s = await VideoEncoder.isConfigSupported({ codec: vcs[i], width:720, height:1280, bitrate:2000000, framerate:30 });
          if (s && s.supported) { window._vkWC.v = vcs[i]; break; }
        }
      }
    } catch(e){}
    try {
      if (window.AudioEncoder) {
        var acs = ['mp4a.40.2','opus'];
        for (var j=0;j<acs.length;j++){
          var s2 = await AudioEncoder.isConfigSupported({ codec: acs[j], sampleRate:44100, numberOfChannels:1, bitrate:128000 });
          if (s2 && s2.supported) { window._vkWC.a = acs[j]; break; }
        }
      }
    } catch(e){}
    window._vkWC.ready = true;
    show();
  }
  probe();
})();
