SGS – Sistema de Gestão de Solicitações

📌 Sobre o projeto

O SGS – Sistema de Gestão de Solicitações é um projeto acadêmico desenvolvido como Produto Mínimo Viável (MVP) do curso de Análise e Desenvolvimento de Sistemas.

O objetivo é oferecer uma solução web simples para organizar, registrar e acompanhar solicitações de clientes, substituindo controles manuais realizados por mensagens e anotações.

O projeto busca facilitar o gerenciamento das demandas, melhorar a organização das informações e otimizar o acompanhamento dos atendimentos.

🎯 Objetivos
Centralizar o registro de solicitações.
Facilitar a consulta de informações.
Permitir o acompanhamento do status dos atendimentos.
Reduzir o risco de perda ou duplicidade de registros.
Oferecer uma interface simples, intuitiva e responsiva.

⚙️ Funcionalidades do MVP
Cadastro de clientes.
Cadastro de solicitações.
Consulta das solicitações registradas.
Atualização do status dos atendimentos.
Visualização de informações dos registros.
Autenticação de usuários.

Status previstos:
Pendente;

Em andamento;

Concluído;

💻 Tecnologias previstas
Tecnologia	Finalidade
Python 3.12	Linguagem de programação
Flask	Desenvolvimento da aplicação web
SQLite	Banco de dados
HTML5	Estrutura das páginas
CSS3	Estilização da interface
Bootstrap 5	Interface responsiva
JavaScript	Interatividade das telas

🏗️ Arquitetura

O sistema foi planejado utilizando o padrão Model-View-Controller (MVC), com separação de responsabilidades:

Model: representação e persistência dos dados.
View: apresentação das interfaces ao usuário.
Controller: processamento das requisições e regras da aplicação.

Essa organização facilita a manutenção, os testes e futuras melhorias.

🖥️ Telas do sistema
Tela 1 – Página inicial

Apresenta a listagem das solicitações, seus respectivos status e as opções de navegação.

Tela 2 – Nova solicitação

Permite registrar uma nova solicitação, informando cliente, telefone, assunto e descrição.

Tela 3 – Confirmação e consulta

Apresenta a confirmação do cadastro e permite visualizar a solicitação registrada.

🗄️ Modelo de dados

O sistema foi planejado com duas entidades principais:

Cliente

ID
Nome
Telefone

Solicitação

ID
Cliente
Assunto
Descrição
Data de criação
Status

Um cliente poderá possuir várias solicitações.

🔒 Segurança e acessibilidade

O projeto prevê:

Autenticação de usuários.
Proteção das senhas por hash seguro.
Validação dos campos obrigatórios.
Controle de acesso às funcionalidades.
Navegação por teclado.
Contraste adequado.
Mensagens claras de erro e confirmação.
Interface responsiva.
🌱 Objetivo de Desenvolvimento Sustentável

O projeto está relacionado ao ODS 9 – Indústria, Inovação e Infraestrutura.

A proposta busca incentivar o uso da tecnologia para modernizar processos e melhorar a eficiência operacional de pequenas organizações.

📚 Contexto acadêmico

Projeto: SGS – Sistema de Gestão de Solicitações
 Curso: Análise e Desenvolvimento de Sistemas
 Tipo: Projeto acadêmico / MVP
 Autora: Aretha Lira de Lima

🚀 Status do projeto

Em desenvolvimento.

O planejamento, os requisitos e os protótipos das três telas foram elaborados. A implementação do sistema funcional está em andamento.

🔮 Melhorias futuras
Filtros avançados de solicitações.
Relatórios gerenciais.
Notificações automáticas.
Histórico de alterações.
Integração com outros sistemas.
