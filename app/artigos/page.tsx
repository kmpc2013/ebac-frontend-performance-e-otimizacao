import { getArtigos } from "@/lib/artigos"
import ListaArtigos from '../components/ListaArtigos'

export default async function ArtigosPage() {
    const artigos = await getArtigos();
    return (
        <div className="mx-auto max-w-3xl px-4 py-16">
            <h2 className="font-display text-2xl uppercase tracking-wide text-neon-cyan">ArtigosPage</h2>
            <hr className="my-8 border-t-2 border-dashed border-border" />
            <ListaArtigos artigos={artigos} />
        </div>
    )
}
