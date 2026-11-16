# Relatório de testes automatizados e cobertura — SGS

**Discente:** Aretha Lira de Lima  
**Data da execução:** 16/11/2026  
**Sistema avaliado:** SGS — Sistema de Gestão de Solicitações  
**Arquivo sob teste:** `js/app.js`  
**SHA-256 do arquivo testado:** `ba968ca5e1e97dd9914721902d3fc184ad0531041c92cdb8a2b632ba87147dd4`

## 1. Objetivo

Automatizar testes unitários e de integração do código JavaScript do SGS, executar a suíte em navegador real e medir a cobertura efetivamente alcançada. O arquivo `app.js` foi testado sem alteração de suas regras de negócio.

## 2. Estratégia e ambiente

- **Executor:** pytest 9.1.1, em Python 3.12.16.
- **Automação de navegador:** Playwright 1.57.0.
- **Navegador usado na execução:** Chromium 149.0.7827.55, modo headless.
- **Cobertura:** API `Profiler.startPreciseCoverage` do motor V8/Chromium.
- **DOM de teste:** `tests/browser_harness.html`, criado porque o material fornecido continha somente `app.js`. O harness implementa os elementos e seletores esperados pelo script.

## 3. Testes executados

Foram executados **22 casos automatizados**, sendo **12 casos unitários** e **10 casos de integração**.

### Testes unitários

- Validação isolada dos campos obrigatórios do login.
- Exibição e ocultação da senha e atualização dos atributos de acessibilidade.
- Cinco variações da máscara de telefone.
- Contador de caracteres da descrição.
- Recuperação após JSON inválido no armazenamento.
- Descarte de registros com identificador ou status inválido.
- Fallback para memória quando as APIs de armazenamento lançam erro.
- Renderização visual dos três status permitidos.

### Testes de integração

- Rejeição de credenciais inválidas, login válido e logout.
- Validação do formulário e cadastro persistente de solicitação.
- Bloqueio e correção de telefone inválido.
- Pesquisa, combinação de filtros, estado vazio e limpeza dos filtros.
- Filtros por período, ordenação e paginação.
- Visualização em modal, atualização de status e persistência.
- Atalho de notificações e páginas de clientes e cadastros.
- Menu lateral, menu do usuário e clique fora.
- Controle de foco, tecla Tab, Shift+Tab, Escape e fechamento do modal.
- Normalização de rota inválida e cancelamento de novo cadastro.

## 4. Resultado da execução

| Indicador | Resultado |
|---|---:|
| Testes coletados | 22 |
| Testes aprovados | 22 |
| Falhas | 0 |
| Erros | 0 |
| Tempo da execução final | 39,49 s |
| Taxa de aprovação | 100% |

## 5. Cobertura real obtida

| Métrica | Cobertos | Total instrumentado | Percentual |
|---|---:|---:|---:|
| Linhas executáveis | 546 | 587 | **93,02%** |
| Funções | 104 | 109 | **95,41%** |
| Blocos detalhados | 109 | 148 | **73,65%** |
| Caracteres não brancos instrumentados | 22.780 | 25.004 | **91,11%** |

A cobertura foi calculada a partir dos intervalos de execução retornados diretamente pelo V8. Uma linha é considerada coberta quando ao menos um intervalo V8 aplicável à linha foi executado; uma função é coberta quando seu intervalo-raiz possui contagem maior que zero; e um bloco é coberto quando seu intervalo detalhado não-raiz foi executado.

## 6. Conclusão

A suíte final foi concluída com **22 de 22 testes aprovados**. O principal indicador acadêmico pode ser apresentado como **93,02% de cobertura de linhas executáveis do `app.js`**, acompanhado de **95,41% de funções** e **73,65% de blocos**. Os testes cobrem autenticação, validações, cadastro, persistência, consulta, filtros, ordenação, paginação, atualização de status, navegação e comportamentos de acessibilidade.

## 7. Evidências geradas

- `evidence/test-run.txt`: saída integral da execução final.
- `evidence/junit-results.xml`: resultado estruturado dos 22 testes.
- `evidence/coverage-summary.txt`: resumo textual da cobertura.
- `evidence/coverage-summary.json`: métricas estruturadas e linhas não cobertas.
- `evidence/coverage-report.html`: relatório navegável com detalhamento por linha.
- `evidence/01-cadastro-aprovado.png`: captura do fluxo de cadastro aprovado.
- `evidence/02-status-atualizado.png`: captura após atualização de status.
- `evidence/03-resumo-cobertura.png`: captura do resumo de cobertura.

## 8. Como reproduzir

No diretório raiz do projeto:

```bash
python -m pip install -r requirements-test.txt
playwright install chromium
pytest -v --junitxml=evidence/junit-results.xml | tee evidence/test-run.txt
```

O workflow `.github/workflows/tests.yml` executa os mesmos passos no GitHub Actions e publica a pasta `evidence/` como artefato.

## 9. Limitação do escopo

Como apenas o arquivo `app.js` foi fornecido, os testes de integração usam um DOM controlado que contém os elementos esperados pelo script. Eles validam a integração real entre `app.js`, eventos do navegador, DOM, rotas por hash, `localStorage` e `sessionStorage`; porém não validam diferenças que possam existir no `index.html` ou no CSS do repositório completo. Para uma validação ponta a ponta do site publicado, o mesmo conjunto deve ser executado também contra a página HTML real.
