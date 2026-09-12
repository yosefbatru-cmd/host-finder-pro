const BASE = ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    let detail = res.statusText || 'Request failed'
    try {
      const err = await res.json()
      if (typeof err.detail === 'string') detail = err.detail
      else if (Array.isArray(err.detail)) detail = err.detail.map(d => d.msg || JSON.stringify(d)).join('; ')
      else if (err.detail) detail = JSON.stringify(err.detail)
    } catch (_) {}
    throw new Error(detail)
  }
  return res.json()
}

export const api = {
  listDomains: () => request('/api/domains'),
  createDomain: (name) => request('/api/domains', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteDomain: (id) => request(`/api/domains/${id}`, { method: 'DELETE' }),
  listSubdomains: (domainId) => request(`/api/subdomains?domain_id=${domainId}`),
  listDns: (domainId) => request(`/api/dns?domain_id=${domainId}`),
  listFiles: (domainId) => request(`/api/files?domain_id=${domainId}`),
  triggerScan: (domain) => request('/api/scan', { method: 'POST', body: JSON.stringify({ domain }) }),
  listScans: () => request('/api/scan'),
  getScan: (id) => request(`/api/scan/${id}`),
  liveEnumerate: (domain) => request(`/api/subdomains/enumerate?domain=${encodeURIComponent(domain)}`),
  liveDns: (domain) => request(`/api/dns/live?domain=${encodeURIComponent(domain)}`),
  importBulk: (domains) => request('/api/import/bulk', { method: 'POST', body: JSON.stringify({ domains }) }),
  exportJson: (domainId) => request(`/api/export/${domainId}?format=json`),
}
