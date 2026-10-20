import Link from "next/link"
import { gerarSlug } from '@/lib/slug'
import type { Artigo } from '@/lib/artigos'

export default function ListaArtigos({ artigos }: { artigos: Artigo[] }) {
    return (
        <div className="grid gap-8 sm:grid-cols-2">
            {artigos.map((artigo) => {
                const slug = gerarSlug(artigo.titulo);
                return (
                    <Link
                        key={slug}
                        href={`/artigos/${slug}`}
                        className="group relative block border-2 border-border bg-card p-6 shadow-[6px_6px_0_0_var(--color-neon-pink)] transition-all duration-200 hover:-translate-y-1 hover:border-neon-cyan hover:shadow-[6px_6px_0_0_var(--color-neon-cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                    >
                        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-neon-orange via-neon-pink to-neon-purple" />
                        <h2 className="font-display text-lg uppercase tracking-wide text-foreground transition-colors group-hover:text-neon-cyan group-hover:underline group-hover:decoration-neon-pink group-hover:decoration-2 group-hover:underline-offset-4 sm:text-xl">
                            {artigo.titulo}
                        </h2>
                        <p className="mt-3 flex items-center gap-2 font-meta text-xs uppercase tracking-[0.15em] text-muted-foreground">
                            <span>{artigo.autor}</span>
                            <span aria-hidden className="h-1 w-1 rotate-45 bg-neon-orange" />
                            <span>{artigo.data_publicacao}</span>
                        </p>
                    </Link>
                )
            })}
        </div>
    )
}
