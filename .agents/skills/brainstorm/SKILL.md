---
name: brainstorm
description: Skill para brainstorming e criação de telas, componentes, features e qualquer coisa que o usuário precise desenvolver. Use quando o usuário pedir ajuda para criar, desenvolver, implementar ou construir algo — seja uma tela inteira, um componente específico, uma feature nova, ou qualquer entrega de código. Sempre pergunte antes de agir para entender completamente o contexto e objetivos. Ofereça sempre a opção de seguir o padrão do projeto atual, mas respeite as regras específicas de cada repositório (design system, stack, arquitetura). O output final deve ser um PLANO detalhado para aprovação do usuário, nunca código direto sem aprovação.
---

# Brainstorm

Skill de brainstorming e planejamento de desenvolvimento. Quando ativada, esta skill transforma uma ideia vaga em um plano de ação detalhado epronto para implementação.

## Fluxo Principal

### 1. Captura de Intenção (SEMPRE o primeiro passo)

Quando o usuário disser algo como:
- "Preciso criar uma tela de..."
- "Desenvolve um componente de..."
- "Quero adicionar a feature..."
- "Me ajuda a construir..."
- "Preciso implementar..."
- Ou qualquer variação de "criar", "desenvolver", "implementar", "construir"

**AÇÃO**: Interrompa e pergunte, não saia codando.

### 2. O Ritual de 3 Perguntas

Antes de qualquer coisa, entenda completamente:

**Pergunta 1 - Domínio e Contexto:**
- "O que exatamente você quer criar?"
- "Onde isso se encaixa no fluxo do usuário?"
- "Quem vai usar isso?"

**Pergunta 2 - Ressalvas e Restrições:**
- "Existem limitações técnicas ou de design que eu deva saber?"
- "Precisa funcionar com dados reais ou mockados?"
- "Tem alguma referência visual (imagem, link, ou .pen file)?"

**Pergunta 3 - Critérios de Sucesso:**
- "Como vamos saber que está pronto?"
- "Existe algo que definitivamente NÃO deve fazer parte disso?"
- "Qual a prioridade: velocidade ou perfeição?"

### 3. Ofereça o Modo "Seguir Padrão do Projeto"

```
💡 Opção: Seguir Padrão do Projeto
Se você estiver trabalhando em um repositório com regras de projeto
(GEMINI.md, stack.md, design-system.md, etc.), posso seguir elas
automaticamente. Quer que eu:
  [A] Sim, detectar e seguir as regras do projeto atual
  [B] Não, trabalhar de forma independente / ignorar regras do projeto
```

### 4. Crie o Plano (PLANO.md)

O output NUNCA é código direto. É sempre um plano detalhado:

```markdown
# Plano: [Nome do que será criado]

## 1. Resumo da Requisição
- O que é: ...
- Onde se encaixa: ...
- Usuários impactados: ...

## 2. Decisões Arquiteturais
- Por que fazer assim (não de outra forma)
- Alternativas consideradas e descartadas
- Justificativa técnica

## 3. Estrutura de Arquivos
├── caminho/para/arquivo.tsx
├── outro/caminho/estilo.css
└── ...

## 4. Componentes a criar
| Componente | Responsabilidade | Props principais |
|------------|-------------------|------------------|
| Nome | O que faz | prop1, prop2 |

## 5. Estados e Interações
- Estados do componente: default, loading, error, empty, ...
- Interações do usuário: click, hover, focus, ...
- Edge cases: dados vazios, erros, loading, ...

## 6. Integrações
- Dependências: libs externasneeded
- APIs: endpoints que serão chamados
- Contextos: estado global envolvido

## 7. Design System (se aplicável)
- Tokens: colors, spacing, typography
- Componentes base reutilizados
- Variações de tema

## 8. Checklist de Implementação
- [ ] Tarefa 1
- [ ] Tarefa 2
- [ ] ...

## 9. Próximos Passos
→ Passo 1: ...
→ Passo 2: ...
→ Passo 3: ... (recomendado)
```

### 5. Aguarde Aprovação

```
⏳ Aguardando sua aprovação para prosseguir com a implementação.
有什么问题或需要调整的地方吗?
```

Se o usuário aprovar → implemente seguindo o plano.
Se o usuário pedir mudanças → ajuste o plano e re-apresente.

## Regras de Ouro

1. **NUNCA pule para código sem plano aprovado**
2. **SEMPRE pergunte se não tiver certeza** — ambiguidade é melhor resolvida com perguntas
3. **Respeite o sistema de design do projeto** — se existe, siga-o
4. **Documente o "porquê"** — decisões técnicas sem justificativa são difíceis de manter
5. **Sea honest about gaps** — se não sabe algo, diga e pergunte

## Tratamento de Casos Especiais

### Projeto sem regras explícitas
Se não houver GEMINI.md, stack.md ou similar:
- Use boas práticas universais de mercado (React, Next.js, etc.)
- Pergunte quais frameworks/libs o projeto usa

### Múltiplas opções possíveis
Se houver mais de uma forma razoável de fazer:
- Apresente as opções com prós/contras
- Recommende uma por padrão, mas deixe claro que é escolha do usuário

### Requisição muito vaga
Se o usuário pedir algo genérico ("faz uma tela"):
- Use o Socratic Gate: pergunte sobre propósito, usuários, escopo
- Não assuma — prefira perguntar demais do que assumir errado

## Output Format

Sempre produza um arquivo `PLANO.md` detalhado. Isso serve como:
- Documentação da decisão
- Base para review do usuário
- Checklist de implementação
- Registro histórico para futuras manutenções
