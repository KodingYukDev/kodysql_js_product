import { useCallback, useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { createFreshDb, runQuery, runSetup } from '@/engine/sqlEngine'
import type { QueryResult } from '@/types'
import { ResultViewer } from '@/components/game/ResultViewer'
import { SQLVisualizer } from '@/components/game/SQLVisualizer'

const TEMPLATES: Record<string, string> = {
  Sekolah: `
CREATE TABLE siswa (id INTEGER, nama TEXT, umur INTEGER, kelas TEXT);
INSERT INTO siswa VALUES (1,'Budi',12,'6A');
INSERT INTO siswa VALUES (2,'Siti',11,'5B');
INSERT INTO siswa VALUES (3,'Andi',13,'7A');
CREATE TABLE guru (id INTEGER, nama TEXT, mapel TEXT);
INSERT INTO guru VALUES (1,'Pak Hendra','Matematika');
INSERT INTO guru VALUES (2,'Bu Sari','IPA');
`,
  Toko: `
CREATE TABLE produk (id INTEGER, nama TEXT, kategori TEXT, harga INTEGER);
INSERT INTO produk VALUES (1,'Buku','Alat Tulis',15000);
INSERT INTO produk VALUES (2,'Pensil','Alat Tulis',3000);
INSERT INTO produk VALUES (3,'Penghapus','Alat Tulis',5000);
CREATE TABLE transaksi (id INTEGER, produk_id INTEGER, qty INTEGER, total INTEGER);
INSERT INTO transaksi VALUES (1,1,3,45000);
INSERT INTO transaksi VALUES (2,2,10,30000);
`,
  'Rumah Sakit': `
CREATE TABLE pasien (id INTEGER, nama TEXT, umur INTEGER, penyakit TEXT);
INSERT INTO pasien VALUES (1,'Ahmad',45,'Flu');
INSERT INTO pasien VALUES (2,'Sari',32,'Demam');
INSERT INTO pasien VALUES (3,'Budi',60,'Diabetes');
CREATE TABLE dokter (id INTEGER, nama TEXT, spesialis TEXT);
INSERT INTO dokter VALUES (1,'dr. Hendra','Umum');
INSERT INTO dokter VALUES (2,'dr. Lina','Penyakit Dalam');
`,
  Game: `
CREATE TABLE player (id INTEGER, nama TEXT, level INTEGER, xp INTEGER);
INSERT INTO player VALUES (1,'Warrior',10,850);
INSERT INTO player VALUES (2,'Mage',8,620);
INSERT INTO player VALUES (3,'Archer',12,1100);
CREATE TABLE item (id INTEGER, nama TEXT, tipe TEXT, damage INTEGER);
INSERT INTO item VALUES (1,'Pedang Besi','Senjata',45);
INSERT INTO item VALUES (2,'Tongkat Ajaib','Senjata',60);
`,
}

export function SandboxPage() {
  const [sql, setSql] = useState('-- Tulis SQL di sini\nSELECT * FROM siswa;')
  const [result, setResult] = useState<QueryResult | null>(null)
  const sandboxDb = useRef<any>(null)

  useEffect(() => {
    try {
      sandboxDb.current = createFreshDb()
      runSetup(TEMPLATES.Sekolah, sandboxDb.current)
    } catch {
      sandboxDb.current = null
    }
  }, [])

  const handleRun = useCallback(() => {
    if (!sql.trim()) return
    const r = runQuery(sql, sandboxDb.current)
    setResult(r)
  }, [sql])

  const loadTemplate = (name: string) => {
    try {
      sandboxDb.current = createFreshDb()
      runSetup(TEMPLATES[name], sandboxDb.current)
      setSql(`-- Template: ${name}\nSELECT * FROM ${name === 'Sekolah' ? 'siswa' : name === 'Toko' ? 'produk' : name === 'Rumah Sakit' ? 'pasien' : 'player'};`)
      setResult(null)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Template Panel */}
      <div className="w-48 bg-slate-900 border-r border-slate-700 p-4 flex flex-col gap-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Template Database</p>
        {Object.keys(TEMPLATES).map((name) => (
          <button
            key={name}
            onClick={() => loadTemplate(name)}
            className="text-left text-sm px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700"
          >
            {name}
          </button>
        ))}
        <div className="mt-auto text-xs text-slate-600">
          Ctrl+Enter untuk run
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <span className="text-xs text-slate-400">🧪 Sandbox — bebas bereksperimen!</span>
          <button
            onClick={handleRun}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            ▶ Jalankan
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            defaultLanguage="sql"
            value={sql}
            onChange={(v) => setSql(v ?? '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              wordWrap: 'on',
              automaticLayout: true,
            }}
            onMount={(editor) => {
              editor.addCommand(2048 + 3, handleRun)
            }}
          />
        </div>

        <div className="h-48 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center px-4 py-2 border-b border-slate-700 bg-slate-800">
            <span className="text-xs text-slate-400">Result</span>
          </div>
          <div className="h-[calc(100%-36px)] overflow-auto">
            <ResultViewer result={result} />
          </div>
        </div>
      </div>

      {/* Visualizer */}
      <div className="w-52 bg-slate-900 border-l border-slate-700 overflow-auto">
        <SQLVisualizer sql={sql} result={result} />
      </div>
    </div>
  )
}
