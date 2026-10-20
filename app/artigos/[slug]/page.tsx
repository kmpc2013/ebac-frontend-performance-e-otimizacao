import { getArtigos, getArtigoPorSlug } from "@/lib/artigos"
import { gerarSlug } from "@/lib/slug";
import { notFound } from "next/navigation"
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const artigo = await getArtigoPorSlug(slug)
    if (!artigo) {
        return {
            title: "Artigo não encontrado",
            description: "O artigo solicitado não existe ou foi removido.",
        };
    }

    return {
        title: artigo.titulo,
        description: artigo.conteudo.slice(0, 155),
    };
}

export default async function ArtigoPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const artigo = await getArtigoPorSlug(slug)
    if (!artigo) return notFound()
    return (
        <article className="mx-auto max-w-2xl px-4 py-16">
            <Link href="/artigos" className="font-meta text-xs uppercase tracking-widest text-neon-cyan hover:text-neon-pink">
                ← Voltar
            </Link>
            <h1 className="mt-4 font-display text-2xl uppercase leading-tight tracking-wide text-neon-pink sm:text-3xl">
                {artigo.titulo}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 font-meta text-sm uppercase tracking-[0.15em] text-muted-foreground">
                <span>{artigo.autor}</span>
                <span aria-hidden className="h-1 w-1 rotate-45 bg-neon-orange" />
                <span>{artigo.data_publicacao}</span>
            </div>
            <hr className="my-8 border-t-2 border-dashed border-border" />
            <p className="whitespace-pre-line font-body text-base leading-relaxed text-foreground sm:text-lg">
                {artigo.conteudo}
            </p>
            <div aria-hidden className="mx-auto mt-12 h-2 w-2 rotate-45 bg-linear-to-br from-neon-orange to-neon-pink" />
        </article>
    )
}

export async function generateStaticParams() {
    const artigos = await getArtigos()
    return artigos.map((artigo) => ({
        slug: gerarSlug(artigo.titulo),
    }));
}
