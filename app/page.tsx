import { getArtigos } from "@/lib/artigos"
import ListaArtigos from './components/ListaArtigos'

export default async function Home() {
  const artigos = await getArtigos();
  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <span className="inline-block border border-neon-cyan px-3 py-1 font-meta text-xs uppercase tracking-[0.2em] text-neon-cyan">
          Retro Tech Digest
        </span>
        <h1 className="mt-6 bg-linear-to-r from-neon-orange via-neon-pink to-neon-purple bg-clip-text font-display text-3xl uppercase tracking-widest text-transparent sm:text-4xl">
          Home
        </h1>
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <ListaArtigos artigos={artigos} />
      </section>
    </>
  );
}
