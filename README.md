# FreelaMatch Web

> Plataforma de Conexão entre Freelancers e Empresas

## 📄 Sobre o Projeto

O **FreelaMatch** é uma plataforma web desenvolvida como Trabalho de Conclusão de Curso em Engenharia de Software, com o objetivo de facilitar a conexão entre freelancers e empresas de forma segura, ágil e intuitiva.

A aplicação oferece um ambiente digital completo para contratação de serviços autônomos, permitindo:

- **Cadastro de perfis** personalizados para freelancers e empresas
- **Sistema de Match inteligente** que conecta profissionais e vagas com base em habilidades e requisitos
- **Busca avançada** com filtros para localização de oportunidades e profissionais qualificados
- **Gerenciamento de propostas** com envio, recebimento e acompanhamento de status
- **Sistema de avaliações mútuas** para promover confiança e transparência
- **Comunicação direta** entre contratantes e profissionais
- **Histórico completo** de propostas e desempenho

A plataforma foi desenvolvida com foco em desempenho, escalabilidade e usabilidade, tornando o processo de intermediação mais transparente e funcional, respondendo às crescentes demandas por flexibilidade e inovação na contratação de talentos.

## 🔗 Links Importantes

- **API Backend**: [freelamatch-api](https://github.com/AnnaBLoz/freelamatch-api)
- **Análise de Código**: [DeepSource](https://app.deepsource.com/gh/AnnaBLoz/freela-match-web)
- **Gestão de Projeto**: [Jira Board](https://freela-match.atlassian.net/jira/software/projects/FLMT/boards/1)
- **Documentação**: [Confluence](https://freela-match.atlassian.net/wiki/spaces/~712020f968dda579d442699a6bba622cb5124c/folder/229556)

## 🎯 Funcionalidades Principais

### Para Freelancers

- Criação e edição de perfil profissional
- Visualização de oportunidades compatíveis via sistema de match
- Busca avançada de vagas por habilidades e categorias
- Recebimento e gerenciamento de propostas
- Sistema de avaliações e histórico de trabalhos

### Para Empresas

- Cadastro e gerenciamento de perfil corporativo
- Criação e publicação de vagas
- Sistema de match automático com freelancers qualificados
- Envio de propostas diretas para profissionais
- Avaliação de freelancers e acompanhamento de propostas

### Para Administradores

- Gerenciamento de usuários
- Moderação de propostas e conteúdos indevidos
- Monitoramento da plataforma

## 📋 Pré-requisitos

- Node.js (versão 18.x ou superior)
- Angular CLI 18.2.20
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/AnnaBLoz/freela-match-web.git
cd freela-match-web
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente necessárias

## 💻 Desenvolvimento

### Servidor de Desenvolvimento

Execute o comando abaixo para iniciar o servidor de desenvolvimento:

```bash
ng serve
```

Navegue até `http://localhost:4200/`. A aplicação será recarregada automaticamente ao modificar os arquivos fonte.

### Geração de Componentes

Para gerar um novo componente:

```bash
ng generate component nome-do-componente
```

Você também pode gerar outros elementos:

```bash
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## 🔨 Build

Para compilar o projeto para produção:

```bash
ng build
```

Os arquivos compilados serão armazenados no diretório `dist/`.

## 🧪 Testes

### Testes Unitários

Execute os testes unitários via [Karma](https://karma-runner.github.io):

```bash
ng test
```

### Testes End-to-End

Para executar os testes end-to-end:

```bash
ng e2e
```

> **Nota**: É necessário adicionar um pacote que implemente capacidades de testes e2e antes de usar este comando.

## 🏗️ Arquitetura

O projeto segue o modelo cliente-servidor com arquitetura SPA (Single Page Application), utilizando:

- **Padrão de Arquitetura**: Componentização baseada em Angular
- **Autenticação**: JWT (JSON Web Tokens)
- **Design Responsivo**: Angular Material e Bootstrap
- **Comunicação com API**: HTTP Client com interceptors

## 📚 Tecnologias Utilizadas

### Front-end

- **Framework**: Angular 18.2.20
- **Linguagem**: TypeScript
- **UI Components**: Angular Material, Bootstrap
- **Gerenciamento de Estado**: RxJS
- **Build Tool**: Angular CLI

### Ferramentas de Desenvolvimento

- **Controle de Versão**: Git/GitHub
- **CI/CD**: Azure DevOps
- **Análise de Código**: DeepSource
- **Gestão de Projeto**: Jira, Confluence

## 🔒 Segurança

A aplicação implementa as seguintes medidas de segurança:

- Autenticação via JWT
- Validação de entradas para prevenir XSS
- Controle de acesso baseado em perfis (RBAC)
- Comunicação segura via HTTPS

## 📖 Documentação Adicional

Para mais informações sobre o Angular CLI, consulte:

- [Documentação Oficial do Angular CLI](https://angular.dev/tools/cli)
- Use `ng help` no terminal para ajuda rápida

## 👥 Autor

**Anna Beatriz Loz Silva e Souza**

- GitHub: [@AnnaBLoz](https://github.com/AnnaBLoz)
- Orientador: Prof. Diogo Vinícius Winck

## 🎓 Contexto Acadêmico

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso do programa de Engenharia de Software do Centro Universitário Católica de Santa Catarina, com o objetivo de aplicar conhecimentos em desenvolvimento web, arquitetura de software e boas práticas de engenharia.

## 📄 Licença

Projeto acadêmico - Todos os direitos reservados © 2025

---

**Desenvolvido com Angular CLI versão 18.2.20**

_Centro Universitário Católica de Santa Catarina - Joinville, SC - 2025_
