# Camada Criativa Convites

Loja de convites digitais (Next.js 16 + Supabase) com painel administrativo.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
```

Crie um `.env.local` (não vai para o git):

```
NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# só para os scripts de banco (nunca é enviado ao navegador)
SUPABASE_DB_URL=postgresql://postgres:<senha>@db.<projeto>.supabase.co:5432/postgres
```

Para publicar (ex.: Vercel), só as duas variáveis `NEXT_PUBLIC_*` são necessárias.

## Painel

- Endereço: `/admin` (não aparece em nenhum link do site e não é indexado).
- Pedidos: lista, busca, filtro por status, detalhes, anotações internas e botão para o WhatsApp do cliente.
- Produtos: criar, editar, ocultar, excluir, enviar imagens reais e ajustar ilustração e cores com prévia ao vivo.
- Preços: formatos (vídeo, imagem, interativo), preço promocional e complementos.
- Configurações: WhatsApp que recebe os pedidos, Instagram, e-mail, horário, prazo de entrega e troca de senha.

Ao salvar no painel, o site é atualizado na hora (cache por tag `catalog`).

## Banco de dados

As tabelas, regras de acesso (RLS) e dados iniciais ficam em `supabase/migrations/`.

```bash
npm run db:migrate                              # aplica as migrações (podem rodar de novo sem duplicar dados)
npm run admin:create -- email@exemplo.com Senha # cria/troca o administrador (só existe um)
```

Segurança:

- Visitantes só leem produtos ativos, formatos, complementos e configurações.
- Pedidos são criados pela função `create_order`, que calcula o total no banco; ninguém de fora consegue ler, alterar ou inserir pedidos diretamente.
- Só o usuário na tabela `admins` pode alterar dados e imagens.
