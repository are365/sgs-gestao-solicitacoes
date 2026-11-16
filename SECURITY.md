# Segurança e privacidade

## Escopo desta edição

O SGS deste repositório é um MVP acadêmico front-end. Ele funciona diretamente no navegador e armazena os registros em `localStorage`.

## Restrições importantes

- O login usa credenciais de demonstração disponíveis no código-fonte; portanto, não é autenticação de produção.
- Os dados ficam no navegador do usuário, sem criptografia ou sincronização.
- Não há controle de autorização no servidor, sessão segura, trilha de auditoria ou recuperação centralizada.
- A limpeza dos dados do navegador remove os registros.

Use exclusivamente dados fictícios. Não registre dados pessoais, médicos, financeiros, credenciais reais ou informações confidenciais.

## Controles aplicados no protótipo

- Saídas produzidas com `textContent`, reduzindo a exposição a XSS no DOM.
- Valores de status limitados a uma lista permitida.
- Validação de campos obrigatórios e tamanho máximo.
- Navegação protegida pela sessão de demonstração durante a aba aberta.
- Sem dependências externas ou coleta de telemetria.

## Evolução recomendada para produção

Uma versão real deve adotar backend (por exemplo, Flask), banco gerenciado, senhas com hash forte, cookies de sessão `HttpOnly`, `Secure` e `SameSite`, proteção CSRF, autorização por rota, consultas parametrizadas, validação no servidor, cabeçalhos de segurança, HTTPS, logs de auditoria, backups e política de retenção/LGPD.


Revisão técnica do MVP
Arquitetura
A aplicação utiliza HTML, CSS e JavaScript, com armazenamento local no navegador. A estrutura é adequada para demonstração acadêmica.

Legibilidade
O código está organizado em arquivos separados, facilitando sua leitura e manutenção.

Segurança
O MVP não possui autenticação nem banco de dados centralizado. Por isso, deve utilizar apenas dados fictícios.

Melhorias futuras
Implementar autenticação segura.
Adicionar banco de dados centralizado.
Ampliar os testes automatizados.
Melhorar os recursos de acessibilidade.
