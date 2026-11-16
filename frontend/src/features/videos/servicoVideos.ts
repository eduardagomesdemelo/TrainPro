import { supabase } from '../../lib/supabase';
import { Resultado, falha } from '../../lib/resultado';

export type CategoriaVideos = {
  nome: string;
  quantidade: number;
};

export type VideoExercicio = {
  id: string;
  nome: string;
  categoria: string;
  videoUrl: string;
  miniaturaUrl: string;
};

type LinhaVideo = {
  id: string;
  nome: string;
  categoria: string;
  video_url: string;
  miniatura_url: string;
};

// A contagem é feita no banco, para não trazer todos os vídeos só para exibir os números.
export async function listarCategoriasDeVideos(): Promise<Resultado<CategoriaVideos[]>> {
  const { data, error } = await supabase.rpc('categorias_de_videos');

  if (error) return falha(error, 'Não foi possível carregar as categorias de vídeos.');
  const linhas = (data ?? []) as { categoria: string; quantidade: number | string }[];
  return {
    ok: true,
    dados: linhas.map((linha) => ({
      nome: linha.categoria,
      // count(*) chega como bigint, que o driver pode devolver como texto.
      quantidade: Number(linha.quantidade),
    })),
  };
}

export async function listarVideosDaCategoria(
  categoria: string,
): Promise<Resultado<VideoExercicio[]>> {
  const { data, error } = await supabase
    .from('videos_exercicio')
    .select('id, nome, categoria, video_url, miniatura_url')
    .eq('categoria', categoria)
    .order('nome');

  if (error) return falha(error, 'Não foi possível carregar os vídeos.');
  return {
    ok: true,
    dados: (data as LinhaVideo[]).map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      categoria: linha.categoria,
      videoUrl: linha.video_url,
      miniaturaUrl: linha.miniatura_url,
    })),
  };
}
