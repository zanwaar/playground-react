import type { MouseEvent } from 'react'
import { tableOfContents } from '../data/editorData'
import Icon from './Icon'

type PageProps = {
  onSelection: (event: MouseEvent<HTMLElement>) => void
}

export function CoverPage({ onSelection }: PageProps) {
  return (
    <article className="a4-page page-enter" onMouseUp={onSelection}>
      <div className="cover-content">
        <div className="cover-line" />
        <h2>LAPORAN PROYEK AKHIR</h2>
        <p className="subtitle">Pengembangan Sistem Dokumentasi Terpadu Berbasis Awan untuk Optimalisasi Kolaborasi Profesional</p>
        <div className="logo-card">
          <Icon>account_balance</Icon>
        </div>
        <div className="author-block">
          <p><strong>Disusun oleh:</strong></p>
          <p>Felix Arvidsson</p>
          <p>NIM: 1202194012</p>
        </div>
        <div className="institution-block">
          <p>FAKULTAS REKAYASA INDUSTRI</p>
          <p>UNIVERSITAS TEKNOLOGI MODERN</p>
          <p>BANDUNG</p>
          <p>2024</p>
        </div>
      </div>
    </article>
  )
}

export function PrefacePage({ onSelection }: PageProps) {
  return (
    <article className="a4-page" onMouseUp={onSelection}>
      <div className="document-body">
        <h3>Kata Pengantar</h3>
        <p>Puji syukur penulis panjatkan kepada Tuhan Yang Maha Esa atas segala rahmat dan hidayah-Nya sehingga Laporan Proyek Akhir ini dapat diselesaikan tepat pada waktunya.</p>
        <p>Laporan ini disusun sebagai salah satu syarat untuk menyelesaikan program studi di Fakultas Rekayasa Industri, Universitas Teknologi Modern. Penulis menyadari bahwa keberhasilan penyusunan laporan ini tidak lepas dari bantuan berbagai pihak.</p>
      </div>
    </article>
  )
}

export function ContentsPage({ onSelection }: PageProps) {
  return (
    <article className="a4-page a4-page--last" onMouseUp={onSelection}>
      <div className="document-body">
        <h3>Daftar Isi</h3>
        <div className="toc-list">
          {tableOfContents.map(([title, page]) => (
            <div className="toc-row" key={title}>
              <span>{title}</span>
              <span>{page}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
