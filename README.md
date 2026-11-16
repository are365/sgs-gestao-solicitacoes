# SGS — Sistema de Gestão de Solicitações

MVP acadêmico, responsivo e executado diretamente no navegador para cadastrar, consultar e acompanhar solicitações de clientes. A interface segue os três protótipos definidos para o projeto.

## Demonstração

**Credenciais fictícias:**

- Usuário: `demo@sgs.local`
- Senha: `Sgs@2026`

## Funcionalidades

- Acesso de demonstração com validação de credenciais.
- Cadastro de cliente e solicitação (RF01 e RF02).
- Listagem, pesquisa e filtros (RF03 e RF05).
- Atualização para `Pendente`, `Em andamento` ou `Concluído` (RF04).
- Mensagem de confirmação e destaque do novo registro.
- Visualização detalhada da solicitação.
- Resumo de clientes e cadastros.
- Persistência local com `localStorage`.
- Layout responsivo, navegação por teclado, foco visível e mensagens textuais.

## Executar no navegador

### Opção 1 — sem instalação

Baixe ou clone o repositório e abra `index.html` em um navegador moderno.

> Alguns navegadores aplicam regras específicas a arquivos locais. Se a persistência não funcionar, use a opção 2.

### Opção 2 — servidor local simples

Com Python disponível:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

Com Node.js disponível:

```bash
npx serve .
```

### Restaurar os dados de demonstração

No console do navegador, execute:

```js
localStorage.removeItem('sgs.requests.v1');
location.reload();
```

## Publicar no GitHub Pages

1. Crie um repositório público chamado `sgs-gestao-solicitacoes`.
2. Envie todos os arquivos deste projeto para a branch `main`.
3. No GitHub, acesse **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main`, pasta `/ (root)` e clique em **Save**.
6. Aguarde a publicação e use o endereço informado pelo GitHub.

Como o projeto é estático, não exige etapa de compilação nem configuração de servidor.

## Estrutura

```text
.
├── index.html
├── css/styles.css
├── js/app.js
├── assets/favicon.svg
├── manifest.webmanifest
├── docs/
│   ├── prototipos/
│   └── screenshots/
├── tests/manual-checklist.md
├── SECURITY.md
└── README.md
```

## Requisitos atendidos

| ID | Requisito | Evidência no sistema |
|---|---|---|
| RF01 | Cadastrar cliente | Campo obrigatório no formulário; cliente aparece nas consultas |
| RF02 | Cadastrar solicitação | Validação, número sequencial e status inicial `Pendente` |
| RF03 | Consultar solicitações | Tabela, pesquisa, filtros e janela de detalhes |
| RF04 | Atualizar status | Seletor na janela de detalhes |
| RF05 | Filtrar solicitações | Filtros por cliente, status, período e busca livre |

## Limites de segurança

Esta edição foi criada para funcionar somente no navegador e usa dados fictícios. A tela de acesso é uma barreira de demonstração; credenciais presentes no código front-end **não constituem autenticação segura**. Não armazene dados pessoais ou sigilosos.

Para uso real, seria necessário um backend com autenticação, controle de autorização, banco de dados servidor, validação no servidor, proteção de sessão e registro de auditoria. Consulte `SECURITY.md`.

## Tecnologias

HTML5, CSS3 e JavaScript ES2022, sem frameworks ou dependências externas.

## Licença

MIT — consulte `LICENSE`.
