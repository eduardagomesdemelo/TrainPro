// Lê os vídeos hospedados no Cloudinary e gera o SQL que cadastra o catálogo no Supabase.
// As credenciais vêm de variáveis de ambiente e nunca são gravadas em arquivo.
// Uso: CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... node gerar_catalogo_videos.mjs
import { writeFileSync } from 'node:fs';

const { CLOUDINARY_CLOUD_NAME: nuvem, CLOUDINARY_API_KEY: chave, CLOUDINARY_API_SECRET: segredo } =
  process.env;
if (!nuvem || !chave || !segredo) throw new Error('Defina as variáveis do Cloudinary.');

const api = `https://api.cloudinary.com/v1_1/${nuvem}`;
const entrega = `https://res.cloudinary.com/${nuvem}`;
const cabecalho = {
  Authorization: 'Basic ' + Buffer.from(`${chave}:${segredo}`).toString('base64'),
  'Content-Type': 'application/json',
};
const MINIATURA = 'so_0,w_480,h_270,c_fill,q_auto,f_jpg';

async function chamar(caminho, opcoes = {}) {
  const resposta = await fetch(`${api}${caminho}`, { headers: cabecalho, ...opcoes });
  if (!resposta.ok) throw new Error(`${caminho}: ${resposta.status} ${await resposta.text()}`);
  return resposta.json();
}

// As pastas de origem não têm acento; aqui ficam com a grafia correta para exibição.
const NOMES_CATEGORIAS = { Abdomen: 'Abdômen', Antebraco: 'Antebraço', Biceps: 'Bíceps', Triceps: 'Tríceps' };

const aspas =(texto) => `'${texto.replace(/'/g, "''")}'`;

const { folders } = await chamar('/folders/videos');
const linhas = [];

for (const pasta of folders) {
  const { resources } = await chamar('/resources/search', {
    method: 'POST',
    body: JSON.stringify({ expression: `folder:"${pasta.path}"`, max_results: 100 }),
  });
  for (const recurso of resources) {
    // Remove o sufixo aleatório de 6 caracteres do Cloudinary e troca "_" por espaço.
    const nome = recurso.public_id
      .split('/')
      .pop()
      .replace(/_[a-z0-9]{6}$/, '')
      .replace(/_/g, ' ');
    const formato = recurso.format ?? 'mp4';
    const video = `${entrega}/video/upload/${recurso.public_id}.${formato}`;
    const miniatura = `${entrega}/video/upload/${MINIATURA}/${recurso.public_id}.jpg`;
    const categoria = NOMES_CATEGORIAS[pasta.name] ?? pasta.name;
    linhas.push(`  (${aspas(categoria)}, ${aspas(nome)}, ${aspas(video)}, ${aspas(miniatura)})`);
  }
}

const sql = `-- Gerado por gerar_catalogo_videos.mjs
insert into public.videos_exercicio (categoria, nome, video_url, miniatura_url) values
${linhas.join(',\n')}
on conflict (video_url) do update
  set categoria = excluded.categoria, nome = excluded.nome, miniatura_url = excluded.miniatura_url;
`;
writeFileSync(new URL('../supabase/09_videos_catalogo.sql', import.meta.url), sql);
console.log(`${folders.length} categorias, ${linhas.length} vídeos.`);
