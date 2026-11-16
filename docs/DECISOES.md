# Decisões do MVP

## Execução

A versão final é uma aplicação estática para funcionar diretamente no navegador e poder ser publicada gratuitamente no GitHub Pages. Não há etapa de compilação nem dependências externas.

## Persistência

Foi utilizado `localStorage` para demonstrar cadastro, consulta e atualização sem exigir instalação de Python ou servidor de banco de dados. A opção é adequada somente para protótipo com dados fictícios.

## Modelo de dados

Cada solicitação contém: número, cliente, telefone opcional, assunto, descrição, data, status e data técnica de criação. Os clientes são derivados das solicitações para evitar complexidade desnecessária no MVP front-end.

## Fluxo das três telas

1. Tela principal: lista, pesquisa, filtros e acesso ao cadastro.
2. Nova solicitação: formulário com validação e status inicial `Pendente`.
3. Resultado: retorno à lista, mensagem de sucesso e destaque do novo registro.

## Fora do escopo

Relatórios, configurações e notificações avançadas permanecem como referências visuais. A autenticação exibida é apenas uma simulação acadêmica; produção exige backend seguro.
