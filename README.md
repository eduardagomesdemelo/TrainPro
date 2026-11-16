# TrainPRO

Aplicativo mobile para organizar treinos de musculação. O usuário monta os seus treinos, registra as séries realizadas, acompanha o histórico, define metas e assiste a vídeos que demonstram a execução correta dos exercícios.

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC).

## Funcionalidades

- **Conta:** cadastro com confirmação por e-mail, login e logout.
- **Treinos:** criação a partir de modelos prontos ou personalizada (sessões e exercícios), listagem e exclusão.
- **Registro de treino:** carga e repetições de cada série, com edição posterior.
- **Histórico:** treinos realizados, agrupados por dia.
- **Metas:** cadastro, conclusão e exclusão de objetivos.
- **Vídeos de demonstração:** exercícios organizados por grupo muscular, com player integrado.
- **Perfil:** edição de nome, e-mail e senha, e foto de perfil.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Aplicativo | React Native, Expo (SDK 58), Expo Router, TypeScript |
| Backend | Supabase: PostgreSQL, Auth, Storage e funções SQL |
| Segurança | Row Level Security (cada usuário acessa apenas os próprios dados) |
| Vídeos | Arquivos hospedados em serviço externo; o catálogo fica no banco |

## Estrutura

```
trainpro/
├── frontend/   Aplicativo Expo (telas em app/, regras de negócio em src/features/)
└── backend/
    ├── supabase/   Scripts SQL numerados (tabelas, políticas RLS e funções)
    └── scripts/    Gerador do catálogo de vídeos
```
