# Notas de migração — Vercel

## Fontes oficiais verificadas em 13/08/2026

- [Express on Vercel](https://vercel.com/docs/frameworks/backend/express): a Vercel permite publicar aplicações Express. O backend opera como função serverless; `express.static()` não atende arquivos estáticos nesse modelo e as limitações de Vercel Functions se aplicam. A documentação também indica que o bundle Express padrão tem limite de 250 MB.
- [Environment Variables](https://vercel.com/docs/environment-variables): variáveis de ambiente ficam fora do código, são criptografadas em repouso e podem ser usadas durante o build e a execução das funções. Alterações só entram em vigor em novos deployments.

## Implicações para o BI Richesse

O frontend Vite pode ser publicado pela Vercel, e o servidor Express/tRPC pode operar como função serverless após adequação do ponto de entrada. O banco TiDB integrado da hospedagem atual não pode ser levado por credencial; será necessário criar um banco externo MySQL/TiDB compatível, migrar o schema e importar os dados. A autenticação OAuth específica da plataforma atual também precisa ser substituída ou temporariamente removida do fluxo externo.

## Banco externo recomendado

- [Conectar a um TiDB Cloud Starter ou Essential](https://docs.pingcap.com/tidbcloud/connect-to-tidb-cluster-serverless/): TiDB Cloud aceita conexão direta por ferramentas e ORMs compatíveis com MySQL, requer TLS e também oferece driver para ambientes serverless como Vercel. Por preservar MySQL/Drizzle, é a opção com menor necessidade de reescrita para este BI.

## Vercel Blob privado e recuperação de backups

- Referência oficial: [Vercel Signed URLs](https://vercel.com/docs/vercel-blob/vercel-signed-urls), consultada em 13/08/2026. Blobs privados devem ser disponibilizados com URL temporária: o servidor emite `issueSignedToken` com escopo `get` e cria a URL com `presignUrl`, sem expor o token de escrita ao navegador.
- Referência de SDK: [Using the Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk), consultada em 13/08/2026. O Blob Store é criado em **Storage → Create Database → Blob** e vinculado ao projeto. A Vercel injeta `BLOB_STORE_ID` e `VERCEL_OIDC_TOKEN` para autenticação de curta duração; `BLOB_READ_WRITE_TOKEN` é o fallback para processos fora da Vercel.
