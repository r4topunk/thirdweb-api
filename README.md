# SSTM Redirect

Serviço para redirecionamento de URLs.

## Todo

- [x] Criar rota de redirect com UUID
  - [x] Redirecionar o usuário a partir do UUID informado
- [x] Adicionar proteção de JWT
  - [x] JWT sem expiração
  - [ ] JWT deve ser salvo no banco de dados
  - [x] JWT deve ser usado para gerar a URL do NFC
  - [ ] JWT deve conter o valor da URL
  - [x] JWT deve ser passado no lugar de UUID
    - [x] Validar JWT
    - [x] Se o JWT for válido, utilizar o UUID dele para buscar no DB

## Objetivo

O objetivo desse projeto é ter uma forma fixa de criar URLs seguras de acesso, que devem redirecionar a partir do registro de UUID.

## Endpoints

`/redirect/:uuid`

Redireciona o usuário para a URL relacionada ao UUID.

## Desenvolvimento

### Inicialização

Para rodar o projeto

```bash
git clone https://github.com/r4topunk/moncy-express-ts-starter.git
```

Para instalar dependências

```bash
pnpm install
```

Configure as variáveis de ambiente copiando o arquivo `.env.exemple` para `.env`

```env
DATABASE_DIRECT_URL=
SESSION_SECRET=
```

Para iniciar o modo de desenvolvimento

```bash
pnpm dev
```

### Alteração de schema

Para gerar a database

```bash
pnpm drizzle:generate
```

Para sincronizar com o banco de dados

```bash
pnpm drizzle:push
```
