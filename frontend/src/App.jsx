import React, { useState, useEffect, useCallback } from 'react'
import { api } from './services/api'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '\u25C8' },
  { id: 'domains', label: 'Domains', icon: '\u25CE' },
  { id: 'scans', label: 'Scans', icon: '\u27F3' },
  { id: 'live', label: 'Live Enum', icon: '\u26A1' },
  { id: 'import', label: 'Import', icon: '\u2191' },
  { id: 'surface', label: 'Attack Surface', icon: '\u25A3' },
]

function App() {
  const [view, setView] = useState('dashboard')
  const [domains, setDomains] = useState([])
  const [scans, setScans] = useState([])
  const [domainInput, setDomainInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [subs, setSubs] = useState([])
  const [dns, setDns] = useState([])
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState(null)
  const [domainTab, setDomainTab] = useState('subdomains')
  const [importText, setImportText] = useState('')

  const showMsg = (text, type = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 6000)
  }

  const refresh = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([api.listDomains(), api.listScans()])
      setDomains(d)
      setScans(s)
    } catch (e) {
      showMsg('Backend offline: ' + e.message, 'error')
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const running = scans.some(s => s.status === 'queued' || s.status === 'running')
    if (!running) return
    const t = setInterval(refresh, 3000)
    return () => clearInterval(t)
  }, [scans, refresh])

  const addAndScan = async () => {
    if (!domainInput.trim()) return
    setLoading(true)
    try {
      try { await api.createDomain(domainInput.trim()) } catch (_) {}
      const job = await api.triggerScan(domainInput.trim())
      showMsg(`Scan queued for ${domainInput.trim()} \u2014 job #${job.id}`, 'success')
      setDomainInput('')
      await refresh()
      setView('scans')
    } catch (e) {
      showMsg(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const openDomain = async (d) => {
    setSelectedDomain(d)
    setView('domain')
    setDomainTab('subdomains')
    try {
      const [s, r, f] = await Promise.all([
        api.listSubdomains(d.id),
        api.listDns(d.id),
        api.listFiles(d.id),
      ])
      setSubs(s); setDns(r); setFiles(f)
    } catch (e) {
      showMsg(e.message, 'error')
    }
  }

  const triggerRescan = async (name) => {
    setLoading(true)
    try {
      const job = await api.triggerScan(name)
      showMsg(`Rescan queued \u2014 job #${job.id}`, 'success')
      await refresh()
    } catch (e) {
      showMsg(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteDomain = async (id, name) => {
    if (!confirm(`Remove ${name} from tracking?`)) return
    try {
      await api.deleteDomain(id)
      showMsg(`Removed ${name}`, 'success')
      if (selectedDomain?.id === id) { setSelectedDomain(null); setView('domains') }
      await refresh()
    } catch (e) {
      showMsg(e.message, 'error')
    }
  }

  const doImport = async () => {
    const lines = importText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    setLoading(true)
    try {
      const res = await api.importBulk(lines)
      showMsg(`Imported ${res.added_count} domains (${(res.skipped || []).length} skipped)`, 'success')
      setImportText('')
      await refresh()
      setView('domains')
    } catch (e) {
      showMsg(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const completed = scans.filter(s => s.status === 'completed').length
  const running = scans.filter(s => s.status === 'running' || s.status === 'queued').length
  const failed = scans.filter(s => s.status === 'failed').length
  const aliveSubs = subs.filter(s => s.is_alive).length
  const credFiles = files.filter(f => f.has_credentials).length

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">HF</div>
          <div>Host Finder <span>Pro</span></div>
        </div>
        <div className="nav-section">Platform</div>
        {NAV.map(n => (
          <button key={n.id}
            className={`nav-item ${view === n.id || (view === 'domain' && n.id === 'domains') ? 'active' : ''}`}
            onClick={() => { setView(n.id); if (n.id !== 'domain') refresh() }}>
            <span className="icon">{n.icon}</span>{n.label}
          </button>
        ))}
        <div className="sidebar-footer">
          <div>Enterprise v1.1.0</div>
          <div style={{ marginTop: 4 }}>Attack surface intelligence</div>
        </div>
      </aside>

      <main className="main">
        <div className="header">
          <div>
            <h1>
              {view === 'dashboard' && 'Dashboard'}
              {view === 'domains' && 'Tracked Domains'}
              {view === 'domain' && (selectedDomain?.name || 'Domain')}
              {view === 'scans' && 'Scan Jobs'}
              {view === 'live' && 'Live Enumeration'}
              {view === 'import' && 'Bulk Import'}
              {view === 'surface' && 'Attack Surface Map'}
            </h1>
            <p className="tagline">Your Entire Attack Surface. One Platform. Nothing Hidden.</p>
          </div>
        </div>

        {message && (
          <div className={`alert alert-${message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}`}>
            {message.text}
          </div>
        )}

        {view === 'dashboard' && (
          <>
            <div className="grid-stats">
              <div className="stat"><div className="label">Tracked Domains</div><div className="value accent">{domains.length}</div></div>
              <div className="stat"><div className="label">Scan Jobs</div><div className="value">{scans.length}</div></div>
              <div className="stat"><div className="label">Completed</div><div className="value success">{completed}</div></div>
              <div className="stat"><div className="label">Running</div><div className="value warning">{running}</div></div>
              <div className="stat"><div className="label">Failed</div><div className="value" style={{ color: failed ? 'var(--danger)' : undefined }}>{failed}</div></div>
            </div>
            <div className="card">
              <h2>Quick Scan</h2>
              <div className="row">
                <input className="input" placeholder="example.com" value={domainInput}
                  onChange={e => setDomainInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAndScan()} />
                <button className="btn" disabled={loading || !domainInput.trim()} onClick={addAndScan}>
                  {loading ? 'Working\u2026' : 'Add & Scan'}
                </button>
              </div>
              <p style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--muted)' }}>
                WHOIS \u2192 DNS \u2192 subdomain enum (CT + passive + brute) \u2192 tech probe \u2192 sensitive path discovery
              </p>
            </div>
            <div className="feature-grid">
              <div className="feature-card"><h3>Subdomain Discovery</h3><p>Certificate Transparency, passive sources, brute-force, resolution validation.</p></div>
              <div className="feature-card"><h3>DNS Intelligence</h3><p>Full record types, SPF/DMARC analysis, nameserver mapping.</p></div>
              <div className="feature-card"><h3>File & Secret Hunt</h3><p>Path probes, credential pattern detection, config exposure.</p></div>
              <div className="feature-card"><h3>Live Enumeration</h3><p>On-demand subdomain discovery without a full scan.</p></div>
            </div>
            <div className="card">
              <div className="card-header-row">
                <h2>Recent Scans</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setView('scans')}>View all</button>
              </div>
              {scans.length === 0 ? <div className="empty">No scans yet</div> : (
                <div className="table-wrap">
                  <table className="table">
                    <thead><tr><th>Domain</th><th>Status</th><th>Progress</th><th>Findings</th></tr></thead>
                    <tbody>
                      {scans.slice(0, 8).map(s => (
                        <tr key={s.id}>
                          <td>{s.domain_name}</td>
                          <td><span className={`badge ${s.status === 'completed' ? 'badge-ok' : s.status === 'failed' ? 'badge-err' : 'badge-info'}`}>{s.status}</span></td>
                          <td>
                            <div className="row" style={{ gap: 8 }}>
                              <div className="progress-bar" style={{ width: 90 }}><div style={{ width: `${Math.min(100, s.progress || 0)}%` }} /></div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{Math.round(s.progress || 0)}%</span>
                            </div>
                          </td>
                          <td>{s.findings_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'domains' && (
          <div className="card">
            <div className="card-header-row">
              <h2>All Domains ({domains.length})</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setView('import')}>Import</button>
            </div>
            {domains.length === 0 ? <div className="empty">No domains tracked yet</div> : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Domain</th><th>Status</th><th>Registrar</th><th>Last Scanned</th><th>Actions</th></tr></thead>
                  <tbody>
                    {domains.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                        <td><span className="badge badge-info">{d.status}</span></td>
                        <td style={{ color: 'var(--muted)' }}>{d.registrar || '\u2014'}</td>
                        <td style={{ color: 'var(--muted)' }}>{d.last_scanned ? new Date(d.last_scanned).toLocaleString() : '\u2014'}</td>
                        <td>
                          <div className="row" style={{ gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openDomain(d)}>Open</button>
                            <button className="btn btn-ghost btn-sm" disabled={loading} onClick={() => triggerRescan(d.name)}>Rescan</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => deleteDomain(d.id, d.name)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {view === 'domain' && selectedDomain && (
          <>
            <div className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ margin: 0, textTransform: 'none', fontSize: '1.15rem', color: 'var(--text)' }}>{selectedDomain.name}</h2>
                  <div className="row" style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.82rem', gap: '1.25rem' }}>
                    <span>Registrar: {selectedDomain.registrar || '\u2014'}</span>
                    <span>Status: {selectedDomain.status}</span>
                  </div>
                </div>
                <div className="row">
                  <button className="btn btn-ghost btn-sm" onClick={() => triggerRescan(selectedDomain.name)}>Rescan</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setView('domains')}>Back</button>
                </div>
              </div>
            </div>
            <div className="grid-stats">
              <div className="stat"><div className="label">Subdomains</div><div className="value accent">{subs.length}</div></div>
              <div className="stat"><div className="label">Alive</div><div className="value success">{aliveSubs}</div></div>
              <div className="stat"><div className="label">DNS Records</div><div className="value">{dns.length}</div></div>
              <div className="stat"><div className="label">Files Found</div><div className="value">{files.length}</div></div>
              <div className="stat"><div className="label">Credential Hits</div><div className="value" style={{ color: credFiles ? 'var(--danger)' : undefined }}>{credFiles}</div></div>
            </div>
            <div className="tabs">
              {['subdomains', 'dns', 'files'].map(t => (
                <button key={t} className={`tab ${domainTab === t ? 'active' : ''}`} onClick={() => setDomainTab(t)}>
                  {t === 'subdomains' && `Subdomains (${subs.length})`}
                  {t === 'dns' && `DNS (${dns.length})`}
                  {t === 'files' && `Files (${files.length})`}
                </button>
              ))}
            </div>
            {domainTab === 'subdomains' && (
              <div className="card">
                {subs.length === 0 ? <div className="empty">No subdomains \u2014 run a scan</div> : (
                  <div className="table-wrap"><table className="table">
                    <thead><tr><th>Name</th><th>IPs</th><th>Alive</th><th>Source</th></tr></thead>
                    <tbody>{subs.map(s => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td style={{ color: 'var(--muted)' }}>{(s.ip_addresses || []).join(', ') || '\u2014'}</td>
                        <td>{s.is_alive ? <span className="badge badge-ok">alive</span> : <span className="badge badge-muted">down</span>}</td>
                        <td style={{ color: 'var(--muted)' }}>{s.source || '\u2014'}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                )}
              </div>
            )}
            {domainTab === 'dns' && (
              <div className="card">
                {dns.length === 0 ? <div className="empty">No DNS records</div> : (
                  <div className="table-wrap"><table className="table">
                    <thead><tr><th>Type</th><th>Name</th><th>Value</th><th>TTL</th></tr></thead>
                    <tbody>{dns.map(r => (
                      <tr key={r.id}>
                        <td><span className="badge badge-info">{r.record_type}</span></td>
                        <td>{r.name}</td>
                        <td style={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.value}>{r.value}</td>
                        <td style={{ color: 'var(--muted)' }}>{r.ttl ?? '\u2014'}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                )}
              </div>
            )}
            {domainTab === 'files' && (
              <div className="card">
                {files.length === 0 ? <div className="empty">No files discovered</div> : (
                  <div className="table-wrap"><table className="table">
                    <thead><tr><th>Path</th><th>Type</th><th>Credentials</th><th>Source</th></tr></thead>
                    <tbody>{files.map(f => (
                      <tr key={f.id}>
                        <td>{f.path || f.url}</td>
                        <td>{f.file_type}</td>
                        <td>{f.has_credentials ? <span className="badge badge-err">exposed</span> : <span className="badge badge-muted">clean</span>}</td>
                        <td style={{ color: 'var(--muted)' }}>{f.source}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                )}
              </div>
            )}
          </>
        )}

        {view === 'scans' && (
          <div className="card">
            <div className="card-header-row">
              <h2>All Scan Jobs</h2>
              <button className="btn btn-ghost btn-sm" onClick={refresh}>Refresh</button>
            </div>
            {scans.length === 0 ? <div className="empty">No scan jobs</div> : (
              <div className="table-wrap"><table className="table">
                <thead><tr><th>ID</th><th>Domain</th><th>Status</th><th>Progress</th><th>Findings</th><th>Error</th></tr></thead>
                <tbody>{scans.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.domain_name}</td>
                    <td><span className={`badge ${s.status === 'completed' ? 'badge-ok' : s.status === 'failed' ? 'badge-err' : 'badge-info'}`}>{s.status}</span></td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <div className="progress-bar" style={{ width: 100 }}><div style={{ width: `${Math.min(100, s.progress || 0)}%` }} /></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{Math.round(s.progress || 0)}%</span>
                      </div>
                    </td>
                    <td>{s.findings_count}</td>
                    <td style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{s.error_message || ''}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        )}

        {view === 'live' && <LiveEnum showMsg={showMsg} />}

        {view === 'import' && (
          <div className="card">
            <h2>Bulk Domain Import</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>One domain per line. Existing domains are skipped.</p>
            <textarea className="input" placeholder={"example.com\ncorp.example.com\nacme.io"}
              value={importText} onChange={e => setImportText(e.target.value)} style={{ maxWidth: '100%', marginBottom: 12 }} />
            <button className="btn" disabled={loading || !importText.trim()} onClick={doImport}>
              {loading ? 'Importing\u2026' : 'Import Domains'}
            </button>
          </div>
        )}

        {view === 'surface' && <SurfaceView domains={domains} scans={scans} onOpen={openDomain} />}
      </main>
    </div>
  )
}

function LiveEnum({ showMsg }) {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const run = async () => {
    if (!domain.trim()) return
    setLoading(true); setResult(null)
    try { setResult(await api.liveEnumerate(domain.trim())) }
    catch (e) { showMsg(e.message, 'error') }
    finally { setLoading(false) }
  }
  return (
    <div className="card">
      <h2>Live Subdomain Enumeration</h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 12 }}>Passive CT + public sources + brute-force. Not persisted unless you run a full scan.</p>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <input className="input" placeholder="example.com" value={domain}
          onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} />
        <button className="btn" disabled={loading || !domain.trim()} onClick={run}>
          {loading ? 'Enumerating\u2026' : 'Run Enum'}
        </button>
      </div>
      {result && (
        <>
          <p className="mono" style={{ marginBottom: '0.75rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Found <strong style={{ color: 'var(--accent)' }}>{result.count}</strong> subdomains for {result.domain}
          </p>
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Subdomain</th><th>IPs</th><th>Alive</th></tr></thead>
            <tbody>{(result.subdomains || []).map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                <td style={{ color: 'var(--muted)' }}>{(s.ip_addresses || []).join(', ') || '\u2014'}</td>
                <td>{s.is_alive ? <span className="badge badge-ok">alive</span> : <span className="badge badge-muted">down</span>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </>
      )}
    </div>
  )
}

function SurfaceView({ domains, scans, onOpen }) {
  const byDomain = {}
  scans.forEach(s => {
    if (!byDomain[s.domain_name] || s.id > byDomain[s.domain_name].id) byDomain[s.domain_name] = s
  })
  return (
    <>
      <div className="card">
        <h2>Attack Surface Overview</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16 }}>Tracked assets and latest scan posture.</p>
        {domains.length === 0 ? <div className="empty">Track domains and run scans to populate the surface map</div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Domain</th><th>Track Status</th><th>Latest Scan</th><th>Findings</th><th></th></tr></thead>
            <tbody>{domains.map(d => {
              const job = byDomain[d.name]
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td><span className="badge badge-info">{d.status}</span></td>
                  <td>{job ? (
                    <span className={`badge ${job.status === 'completed' ? 'badge-ok' : job.status === 'failed' ? 'badge-err' : 'badge-info'}`}>{job.status}</span>
                  ) : <span className="badge badge-muted">none</span>}</td>
                  <td>{job?.findings_count ?? '\u2014'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => onOpen(d)}>Inspect</button></td>
                </tr>
              )
            })}</tbody>
          </table></div>
        )}
      </div>
      <div className="feature-grid">
        <div className="feature-card"><h3>Surface Coverage</h3><p>{domains.length} domains under tracking. Expand with bulk import or quick scan.</p></div>
        <div className="feature-card"><h3>Recon Depth</h3><p>Subdomains, DNS, tech stack, admin panels, sensitive paths, credential hits.</p></div>
        <div className="feature-card"><h3>Next Layers</h3><p>Premium passive APIs, Nuclei correlation, screenshots, and change alerts.</p></div>
      </div>
    </>
  )
}

export default App
