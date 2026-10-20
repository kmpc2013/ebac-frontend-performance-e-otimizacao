import artigosData from "@/data/artigos.json"
import { gerarSlug } from "@/lib/slug";


export type Artigo = {
    titulo: string;
    autor: string;
    data_publicacao: string;
    conteudo: string;
}

export async function getArtigos(): Promise<Artigo[]> {
    return artigosData.artigos;
}

export async function getArtigoPorSlug(slug: string) {
    const artigos = await getArtigos();
    return artigos.find((a) => gerarSlug(a.titulo) === slug);
}