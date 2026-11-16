# Checklist de validação manual

## Preparação

1. Limpar `localStorage` para iniciar com os dados fictícios.
2. Abrir `index.html` em largura desktop e móvel.

## Autenticação de demonstração

- [ ] Credenciais vazias exibem mensagens por campo.
- [ ] Credenciais inválidas exibem alerta textual.
- [ ] `demo@sgs.local` / `Sgs@2026` acessa o sistema.
- [ ] Mostrar/ocultar senha funciona.
- [ ] Sair encerra a sessão da aba.

## Fluxo central

- [ ] A listagem inicial apresenta cinco solicitações.
- [ ] “Nova Solicitação” abre o formulário.
- [ ] Campos obrigatórios vazios impedem o envio.
- [ ] Telefone é opcional e recebe máscara quando preenchido.
- [ ] Um cadastro válido recebe número sequencial e status `Pendente`.
- [ ] Após salvar, a listagem exibe mensagem de sucesso e destaca o registro.
- [ ] O novo registro permanece após recarregar a página.

## Consulta e atualização

- [ ] Pesquisa localiza por número, assunto, descrição ou cliente.
- [ ] Filtros de cliente, status e período funcionam em conjunto.
- [ ] Ordenação funciona para cada coluna disponível.
- [ ] Paginação funciona quando há mais de cinco resultados.
- [ ] Visualizar abre os dados completos.
- [ ] Editar permite somente `Pendente`, `Em andamento` e `Concluído`.
- [ ] A alteração de status permanece após recarregar.

## Responsividade e acessibilidade

- [ ] Menu lateral vira menu recolhível em telas menores.
- [ ] Tabela possui rolagem horizontal sem cortar ações.
- [ ] Todo o fluxo pode ser executado por teclado.
- [ ] Foco é visível.
- [ ] Escape fecha janela modal e menu móvel.
- [ ] A janela modal mantém o foco e o devolve ao controle de origem.
- [ ] Mensagens de erro e sucesso não dependem apenas de cor.
- [ ] Movimento reduzido é respeitado.
