import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

type Page = {
    title?: string
    description?: string
    content?: string
}

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

const renderInline = (value: string) => {
    const escaped = escapeHtml(value)
    return escaped
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

const renderMarkdown = (markdown: string) => {
    const blocks = markdown.trim().split(/\n{2,}/)
    const html = blocks
        .map(block => {
            const lines = block.split(/\n/)
            if (lines.every(line => line.trim().startsWith('- '))) {
                const items = lines
                    .map(line => line.trim().replace(/^-\s+/, ''))
                    .map(item => `<li>${renderInline(item)}</li>`)
                    .join('')
                return `<ul>${items}</ul>`
            }

            const headingMatch = block.match(/^(#{1,3})\s+(.+)/)
            if (headingMatch) {
                const level = headingMatch[1].length
                const content = renderInline(headingMatch[2])
                return `<h${level}>${content}</h${level}>`
            }

            return `<p>${renderInline(block.replace(/\n/g, ' '))}</p>`
        })
        .join('')

    return html
}

const getPagePath = (pathname: string) => {
    const trimmed = pathname.replace(/^\/+|\/+$/g, '')
    return trimmed.length ? trimmed : 'home'
}

const Site = () => {
    const [page, setPage] = useState<Page | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const path = useMemo(() => getPagePath(window.location.pathname), [])

    useEffect(() => {
        const loadPage = async () => {
            try {
                const response = await fetch(`/content/pages/${encodeURIComponent(path)}`)
                if (!response.ok) {
                    throw new Error('Page not found')
                }
                const data = (await response.json()) as Page
                setPage(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load page')
            } finally {
                setLoading(false)
            }
        }

        void loadPage()
    }, [path])

    const contentHtml = useMemo(() => renderMarkdown(page?.content ?? ''), [page?.content])

    return (
        <main
            style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                padding: '2.5rem',
                lineHeight: 1.6,
                maxWidth: '720px',
                margin: '0 auto',
            }}
        >
            <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
                <a href="/">Home</a>
                <a href="/about">About</a>
            </nav>
            {loading && <p>Loading page…</p>}
            {error && (
                <div>
                    <h1>Page not found</h1>
                    <p>{error}</p>
                </div>
            )}
            {!loading && !error && (
                <article>
                    <header style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{ marginBottom: '0.5rem' }}>{page?.title}</h1>
                        {page?.description && <p style={{ color: '#4b5563' }}>{page.description}</p>}
                    </header>
                    <section
                        style={{ display: 'grid', gap: '1rem' }}
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                </article>
            )}
        </main>
    )
}

window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root')
    if (!root) throw new Error('Site root not found')

    createRoot(root).render(<Site />)
})
