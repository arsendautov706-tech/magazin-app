// Утилиты для fetch с сессией и обработки ошибок
const api = {
  async fetchJson(path, opts = {}) {
    const options = Object.assign({ credentials: 'include', headers: {} }, opts);
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    const res = await fetch(path, options);
    const contentType = res.headers.get('content-type')||'';
    const text = await res.text();
    let json = null;
    if (contentType.includes('application/json')) {
      try { json = JSON.parse(text); } catch(e) { json = null; }
    }
    return { ok: res.ok, status: res.status, headers: res.headers, bodyText: text, json };
  },
  downloadFile(url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
