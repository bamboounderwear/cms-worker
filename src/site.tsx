import { createRoot } from 'react-dom/client'

window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root')
    if (!root) throw new Error('Site root not found')

    createRoot(root).render(
        <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem', lineHeight: 1.6 }}>
            <h1>Welcome to the public site</h1>
            <p>This page is served from the public site entrypoint.</p>
        </main>
    )
})
