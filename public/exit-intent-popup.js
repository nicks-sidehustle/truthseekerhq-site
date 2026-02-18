(function() {
  var STORAGE_KEY = 'truthseekerhq_exit_popup';
  var SUBSCRIBED_KEY = 'truthseekerhq_subscribed';

  try {
    if (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(SUBSCRIBED_KEY)) return;
  } catch(e) { return; }

  var triggered = false;
  function trigger() {
    if (triggered) return;
    triggered = true;
    showPopup();
  }

  // Desktop: mouse leaves viewport
  function handleMouseLeave(e) {
    if (e.clientY <= 0) trigger();
  }

  // Mobile: scroll up quickly
  var lastScrollY = window.scrollY;
  var scrollUpDistance = 0;
  function handleScroll() {
    var currentY = window.scrollY;
    if (currentY < lastScrollY) {
      scrollUpDistance += lastScrollY - currentY;
      if (scrollUpDistance > 300 && currentY > 200) trigger();
    } else {
      scrollUpDistance = 0;
    }
    lastScrollY = currentY;
  }

  setTimeout(function() {
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
  }, 5000);

  function showPopup() {
    var overlay = document.createElement('div');
    overlay.id = 'exit-popup-overlay';
    overlay.innerHTML = '\
      <div id="exit-popup-backdrop"></div>\
      <div id="exit-popup-modal">\
        <button id="exit-popup-close" aria-label="Close">&times;</button>\
        <div id="exit-popup-content">\
          <h2>🕵️ Wait! Don\'t Leave Without the Truth</h2>\
          <p>Get classified briefings, investigation updates, and truth reports delivered to your inbox weekly.</p>\
          <form id="exit-popup-form">\
            <input type="email" id="exit-popup-email" placeholder="your@email.com" required />\
            <button type="submit" id="exit-popup-submit">Get the Briefings</button>\
            <p id="exit-popup-error" style="display:none;color:#ef4444;font-size:14px;margin-top:8px;"></p>\
          </form>\
          <p style="font-size:12px;color:#9ca3af;margin-top:16px;text-align:center;">🔒 No spam, ever. Unsubscribe anytime.</p>\
        </div>\
        <div id="exit-popup-success" style="display:none;text-align:center;padding:20px 0;">\
          <div style="font-size:40px;margin-bottom:12px;">🎉</div>\
          <h3 style="font-size:20px;font-weight:bold;color:#e5e5e5;margin-bottom:8px;">You\'re in!</h3>\
          <p style="color:#9ca3af;">Check your inbox for a welcome briefing.</p>\
          <button id="exit-popup-done" style="margin-top:16px;padding:8px 24px;border-radius:8px;background:#dc2626;color:white;border:none;cursor:pointer;font-weight:600;">Got it!</button>\
        </div>\
      </div>';

    var style = document.createElement('style');
    style.textContent = '\
      #exit-popup-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;}\
      #exit-popup-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);}\
      #exit-popup-modal{position:relative;width:100%;max-width:420px;background:#1a1a2e;border:1px solid #333;border-radius:16px;padding:32px;box-shadow:0 25px 50px rgba(0,0,0,0.5);}\
      #exit-popup-close{position:absolute;right:16px;top:16px;background:none;border:none;color:#666;font-size:24px;cursor:pointer;line-height:1;}\
      #exit-popup-close:hover{color:#999;}\
      #exit-popup-modal h2{font-size:22px;font-weight:bold;color:#e5e5e5;margin:0 0 8px 0;padding-right:24px;}\
      #exit-popup-modal p{color:#9ca3af;margin:0 0 20px 0;line-height:1.5;}\
      #exit-popup-email{width:100%;padding:12px 16px;border-radius:8px;border:1px solid #444;background:#0d0d1a;color:#e5e5e5;font-size:16px;box-sizing:border-box;outline:none;}\
      #exit-popup-email:focus{border-color:#dc2626;box-shadow:0 0 0 2px rgba(220,38,38,0.3);}\
      #exit-popup-submit{width:100%;padding:12px;border-radius:8px;background:#dc2626;color:white;border:none;font-size:16px;font-weight:600;cursor:pointer;margin-top:12px;}\
      #exit-popup-submit:hover{background:#b91c1c;}\
      #exit-popup-submit:disabled{opacity:0.6;cursor:not-allowed;}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    function dismiss() {
      overlay.remove();
      style.remove();
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e) {}
    }

    document.getElementById('exit-popup-close').onclick = dismiss;
    document.getElementById('exit-popup-backdrop').onclick = dismiss;
    if (document.getElementById('exit-popup-done')) {
      document.getElementById('exit-popup-done').onclick = dismiss;
    }

    document.getElementById('exit-popup-form').onsubmit = function(e) {
      e.preventDefault();
      var email = document.getElementById('exit-popup-email').value;
      if (!email) return;
      var btn = document.getElementById('exit-popup-submit');
      var errEl = document.getElementById('exit-popup-error');
      btn.disabled = true;
      btn.textContent = 'Subscribing...';
      errEl.style.display = 'none';

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: 'exit-intent' })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success || data.message) {
          document.getElementById('exit-popup-content').style.display = 'none';
          document.getElementById('exit-popup-success').style.display = 'block';
          try {
            localStorage.setItem(SUBSCRIBED_KEY, '1');
            localStorage.setItem(STORAGE_KEY, '1');
          } catch(e) {}
        } else {
          errEl.textContent = data.error || 'Something went wrong.';
          errEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Get the Briefings';
        }
      })
      .catch(function() {
        errEl.textContent = 'Connection error. Please try again.';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Get the Briefings';
      });
    };
  }
})();
