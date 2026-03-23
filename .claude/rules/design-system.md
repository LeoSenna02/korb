# Sistema de Design: Serenidade em Dados



## 1. Visão Geral & Estrela do Norte Criativa

Este sistema de design foi concebido para ser um santuário digital. Para pais exaustos e privados de sono, a interface não deve ser apenas uma ferramenta de registro, mas um ambiente de calma e clareza.



**A Estrela do Norte: "Minimalismo Sensorial"**

Diferente de aplicativos utilitários padrão que sobrecarregam o usuário com grades rígidas e alertas estridentes, este sistema utiliza uma abordagem editorial de alta gama. Quebramos a estética de "template" através de uma hierarquia tipográfica de alto contraste, assimetria intencional em layouts de cards e uma profundidade tonal que prioriza o descanso ocular. O objetivo é que a interface pareça uma extensão orgânica do ambiente de cuidados com o bebê — suave, tátil e silenciosa.



---



## 2. Cores e Atmosfera

A paleta é profunda e dessaturada, projetada para uso em ambientes de baixa luminosidade (madrugadas).



### A Regra do "Sem Linhas" (No-Line Rule)

**Proibimos estritamente o uso de bordas sólidas de 1px para seccionamento.** A separação de conteúdo deve ser alcançada exclusivamente através de:

1. **Mudanças de Tom:** Um card `surface_container_low` sobre um fundo `surface`.

2. **Espaçamento Negativo:** Uso generoso da escala de 8px para isolar grupos de dados.

3. **Transições Tonais:** Degradês sutis entre o fundo e a superfície.



### Hierarquia de Superfícies e Camadas

Tratamos a UI como folhas de papel vegetal escuro sobrepostas.

- **Nível 0 (Background):** `surface_dim` (#111319) – O pano de fundo infinito.

- **Nível 1 (Seções):** `surface_container_low` (#191B22) – Para agrupar fluxos relacionados.

- **Nível 2 (Cards de Interação):** `surface_container` (#1E1F26) – Onde a ação acontece.

- **Nível 3 (Modais/Popovers):** `surface_container_highest` (#33343B) – Elementos que demandam foco imediato.



### A Regra "Glass & Gradient"

Para evitar uma aparência "flat" genérica, elementos flutuantes (como o seletor de timer) devem utilizar **Glassmorphism**:

- Fundo: `surface_variant` com 60% de opacidade.

- Efeito: `backdrop-blur` de 12px a 20px.

- Isso permite que as cores do dashboard "sangrem" suavemente através do vidro, criando uma sensação de integração e luxo.



---



## 3. Tipografia Editorial

A tipografia é o nosso principal elemento de design. Combinamos a modernidade geométrica da **DM Sans** com a precisão técnica da **DM Mono**.



* **Display & Headline (DM Sans 600):** Usadas para momentos de celebração ou estados principais (ex: "O sono de hoje"). Devem ser grandes, com tracking levemente reduzido (-2%) para um visual premium.

* **Body (DM Mono):** Utilizada para todos os dados variáveis (horas, ml, kg). A natureza monoespaçada confere uma estética de "relatório técnico sofisticado", facilitando a leitura rápida por olhos cansados.

* **Hierarquia de Identidade:** O contraste entre uma Headline orgânica e um dado Mono cria a assinatura visual deste sistema — o encontro do afeto com o registro preciso.



---



## 4. Elevação e Profundidade Tonal

Neste sistema, a profundidade é sentida, não vista.



* **Princípio de Empilhamento:** A elevação é comunicada pelo clareamento da superfície. Quanto mais próximo do usuário, mais clara é a cor do token `surface_container`.

* **Sombras Ambientes:** Sombras são reservadas para elementos que flutuam fisicamente (Floating Action Buttons). Use valores de blur amplos (32px+) com opacidade de 4% a 8%, utilizando um tom derivado de `on_surface` (azul-acinzentado escuro) em vez de preto puro.

* **O Fallback "Ghost Border":** Se uma borda for indispensável para acessibilidade, utilize o token `outline_variant` com apenas **15% de opacidade**. Ela deve ser quase imperceptível, servindo apenas como uma "sugestão" de limite.



---



## 5. Componentes de Assinatura



### Botões (Buttons)

- **Primary:** Fundo `primary_container` (#7B9E87), texto `on_primary_container`. Sem sombras internas. Raio de 12px.

- **Secondary:** Fundo `secondary_container` (#584325), texto `on_secondary_container`. Para ações de apoio.

- **Floating Timer:** Um elemento de vidro (Glassmorphism) com bordas arredondadas de 999px, flutuando na base da tela.



### Cards & Listas

- **Regra de Ouro:** Proibido o uso de linhas divisórias (dividers).

- Use `spacing-6` (1.5rem) para separar itens de lista ou mude sutilmente o tom do fundo entre itens ímpares e pares se a densidade de dados for alta.

- Todos os cards devem ter `corner-radius: 16px`.



### Inputs de Registro

- Campos de texto não possuem bordas. Eles utilizam um preenchimento `surface_container_highest` com uma linha de base (bottom-stroke) de 2px apenas quando focados, no tom `primary`.

- O texto de ajuda (helper text) deve sempre usar `DM Mono` em `label-sm`.



### Bottom Sheets (Folhas de Ação)

- Raio superior de 24px.

- Devem ocupar o espaço de forma assimétrica se possível (ex: não cobrir a tela inteira, deixando uma margem de 8px nas laterais para reforçar a ideia de camada sobreposta).



---



## 6. Do's and Don'ts



### Do (Faça)

- **Priorize o Espaço:** Se estiver em dúvida, adicione mais 8px de respiro. Pais cansados precisam de alvos de toque grandes e clareza visual.

- **Use Ícones Suaves:** Lucide 1.5px stroke em `text_secondary` para manter a leveza.

- **Micro-interações:** Use transições de opacidade suaves (200ms) ao alternar estados, evitando mudanças bruscas de luz.



### Don't (Não faça)

- **Não use Vermelho Puro:** Para erros ou estados destrutivos, use o token `tertiary_container` (#CD8282). É um "alerta gentil", menos estressante.

- **Não use Preto Puro (#000):** O contraste excessivo causa fadiga ocular. Mantenha-se fiel ao `surface_dim`.

- **Não force o Grid:** Permita que elementos de dados (DM Mono) quebrem o alinhamento vertical das headlines para criar um ritmo visual mais dinâmico e editorial.