# Testes automatizados do SGS

Este pacote acrescenta testes unitários e de integração ao SGS sem modificar `js/app.js`.

## Arquivos que devem ir para o repositório

Copie para a raiz do projeto, preservando as pastas:

- `.github/workflows/tests.yml`
- `requirements-test.txt`
- `pytest.ini`
- `tests/`
- `tools/`
- `RELATORIO-ACADEMICO.md`
- `evidence/` (evidências da execução já realizada)

O arquivo `js/app.js` incluído no pacote é a cópia exata usada na medição. Se o repositório já tiver o mesmo arquivo, não é necessário substituí-lo.

## Execução local

```bash
python -m pip install -r requirements-test.txt
playwright install chromium
pytest -v --junitxml=evidence/junit-results.xml | tee evidence/test-run.txt
```

## GitHub Actions

Ao enviar os arquivos para a branch `main`, o workflow **SGS - Testes e cobertura** será executado. Na página da execução, o artefato **sgs-evidencias-testes** conterá os logs, o XML JUnit, as capturas e o relatório de cobertura.

## Resultado verificado em 16/11/2026

- 22 testes aprovados de 22.
- 0 falhas e 0 erros.
- Cobertura de linhas: 93,02%.
- Cobertura de funções: 95,41%.
- Cobertura de blocos: 73,65%.
- Cobertura de bytes instrumentados: 91,11%.
