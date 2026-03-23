---
name: code-review
description: Realiza revisão de código completa e abrangente de toda a base de código. Use esta skill sempre que o usuário pedir para revisar código, fazer code review, auditar código, analisar arquitetura, identificar bugs, problemas de segurança, performance ou qualidade de código. Esta skill é ideal quando você precisa entender um projeto do zero, fazer uma análise profunda, ou criar um arquivo QUESTIONS.md com todas as questões arquiteturais e técnicas encontradas. Não espere o usuário dizer explicitamente "code review" - qualquer menção a revisar código, analisar estrutura, verificar bugs, auditar segurança ou avaliar qualidade técnica deve acionar esta skill.
---

# Code Review Completo — Revisor de Código Profissional

Esta skill atua como um **revisor de código profissional e líder técnico** para realizar uma análise abrangente de toda a base de código.

## Quando Usar

- Usuário pede para "revisar código", "fazer code review", "auditar código"
- Usuário quer entender a arquitetura completa de um projeto
- Usuário precisa identificar bugs, problemas de segurança ou performance
- Usuário quer um arquivo QUESTIONS.md com todas as questões técnicas
- Usuário está starting um novo projeto e quer uma análise profunda
- Qualquer menção a analisar, auditar, revisar ou avaliar código

## Processo de Análise

### Fase 1: Exploração Inicial

**NÃO leia arquivos individuais ainda.** Comece explorando a estrutura:

1. Identifique a **stack tecnológica** (framework, linguagem, libs)
2. Mapeie a **estrutura de pastas** principal
3. Identifique os **padrões arquiteturais** usados
4. Liste os **endpoints de API** se houver
5. Identifique **ponto de entrada** (main, index, etc.)
6. Procure por arquivos de **configuração** (package.json, tsconfig, etc.)

Use `Glob` para mapear a estrutura de arquivos. Use `Grep` para encontrar padrões.

### Fase 2: Análise Profunda por Domínio

Após a exploração inicial, analise cada domínio/funcionalidade:

#### 2.1 Autenticação e Autorização
- Como auth é implementado?
- Tokens são armazenados de forma segura?
- Há proteção de rotas?
- Senhas são hasheadas?
- Session management é seguro?

#### 2.2 API Routes / Backend
- Validação de input?
- Sanitização de dados?
- Rate limiting?
- CORS configurado?
- Headers de segurança (CSP, XSS, etc.)?
- SQL injection possível?
- Error handling apropriado?

#### 2.3 Frontend / UI
- State management seguro?
- Dados sensíveis expostos no client?
- XSS possível?
- Validação de formulários?
- Loading states e error states?
- Responsividade?

#### 2.4 Padrões Arquiteturais
- Separation of concerns respeitado?
- SRP (Single Responsibility) seguido?
- Acoplamento entre módulos?
- Reutilização de código?
- DRY aplicado?

#### 2.5 Performance
- Queries N+1?
- Assets não otimizados?
- Bundle size?
- Cache apropriado?
- Lazy loading onde necessário?

#### 2.6 Segurança
- Credenciais hardcoded?
- Secrets no código?
- Permissões corretas?
- Input validation?
- Output encoding?
- HTTPS forçado?

#### 2.7 TypeScript/Types
- Tipagem forte ou uso de `any`?
- Types definidos corretamente?
- Interfaces bem estruturadas?
- Generics usados corretamente?

### Fase 3: Geração do QUESTIONS.md

Após analisar tudo, determine o tipo predominante do review e salve o documento na pasta `questions/` com o nome apropriado:

| Tipo Predominante | Nome do Arquivo |
|--------------------|------------------|
| Segurança | `questions/QUESTIONS-SECURITY.md` |
| Bugs/Problemas | `questions/QUESTIONS-BUGS.md` |
| Arquitetura | `questions/QUESTIONS-ARCHITECTURE.md` |
| Performance | `questions/QUESTIONS-PERFORMANCE.md` |
| Geral/Completo | `questions/QUESTIONS.md` |

Se o review for multi-temático (ex: segurança + bugs + performance), use `QUESTIONS.md` como padrão.

Use o seguinte template:

```markdown
# Code Review — QUESTIONS.md

## 📋 Resumo Executivo
[Breve descrição do projeto, stack e objetivos]

## 🔴 Problemas Críticos (Bug/Segurança)
[Perguntas sobre bugs reais ou vulnerabilidades de segurança]

## 🟡 Arquitetura e Padrões
[Perguntas sobre decisões arquiteturais estranhas ou questionáveis]

## 🟠 Refatoração
[Perguntas sobre oportunidades de refatoração]

## 🔵 Performance
[Perguntas sobre problemas de performance]

## 🟢 Boas Práticas
[Perguntas sobre compliance com boas práticas]

## 📝 Perguntas Gerais
[Outras questões que precisam de contexto ou esclarecimento]

---

## Como Responder

Para cada pergunta:
1. **Se for bug**: Explique o comportamento esperado vs. atual e como corrigir
2. **Se for arquitetura**: Explique a decisão atual e se deve mudar
3. **Se for melhoria**: Descreva a sugestão e o impacto
4. **Se precisar de contexto**: Forneça o contexto necessário

Você pode responder diretamente neste arquivo, usando o formato:
```markdown
### [ID da Pergunta]

**Resposta:** [Sua resposta]
**Ação:** [O que deve ser feito, se aplicável]
**Prioridade:** [Crítica/Alta/Média/Baixa]
```
```

## Formato das Perguntas

Cada pergunta deve:
1. Ser **auto-contida** (ter contexto suficiente para ser respondida sozinha)
2. Ter um **ID único** (ex: `ARQ-001`, `SEC-001`, `BUG-001`)
3. Ser **específica** (não perguntas genéricas)
4. Incluir **localização** (caminho do arquivo, linha se possível)
5. Ter **categoria** (Bug, Arquitetura, Refatoração, Performance, Segurança, Geral)

## Categorização de Prioridade

| Símbolo | Significado | Ação |
|---------|-------------|------|
| 🔴 | Crítico | Corrigir imediatamente |
| 🟡 | Alto | Corrigir em breve |
| 🟠 | Médio | Planejar correção |
| 🟢 | Baixo | Melhoria opcional |

## Dicas Importantes

1. **Seja exaustivo**: É melhor ter muitas perguntas do que perder algo importante
2. **Seja específico**: "Há SQL injection em /api/users" é melhor que "Verificar segurança"
3. **Inclua evidências**: Mostre onde encontrou o problema
4. **Sugira soluções**: Quando óbvio, sugira como corrigir
5. **Questione decisões**: Se algo parece estranho, pergunte - talvez haja razão válida
6. **Não assuma malícia**: Dê benefit of the doubt, mas documente a preocupação

## Output Final

Ao final, forneça um **sumário executivo**:
- Total de problemas encontrados
- Por categoria (críticos, altos, médios, baixos)
- Principais preocupações
- Recomendações de ação imediata
