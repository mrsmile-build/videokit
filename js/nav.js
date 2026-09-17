// js/nav.js - Shared bottom navigation (Studio = center action)
(function(){
  var tabs = [
    {href:'index.html', label:'Home', svg:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'},
    {href:'history.html', label:'History', svg:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>'},
    {href:'ai.html', label:'Studio', svg:'<path d="M12 8v4l3 3"/>', center:true},
    {href:'create.html', label:'Editor', svg:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'},
    {href:'menu.html', label:'Menu', svg:'<circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>'}
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');
  var host = document.getElementById('vkNav');
  if (!host) return;
  host.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#0d0d0d;border-top:1px solid #1e1e1e;display:flex;z-index:99999';
  host.innerHTML = tabs.map(function(t){
    var active = (t.href === here);
    var color = active ? '#ff5c00' : '#555';
    var icon = t.center
      ? '<span style="width:42px;height:42px;margin-top:-24px;background:#ff5c00;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(255,92,0,.45)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="' + (active ? '#fff' : '#fff') + '" stroke-width="2"><circle cx="12" cy="12" r="10"/>' + t.svg + '</svg></span>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + t.svg + '</svg>';
    return '<a href="' + t.href + '" style="flex:1;display:flex;flex-direction:column;align-items:center;padding:14px 0 10px;color:' + color + ';text-decoration:none;font-size:.65rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;gap:5px">' + icon + t.label + '</a>';
  }).join('');
})();
