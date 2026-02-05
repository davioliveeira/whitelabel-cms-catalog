# Front-end Specification: Boutique Digital

## 1. Design Vision
* **Conceito:** Luxo Minimalista.
* **Fundação:** `shadcn/ui` + Tailwind CSS.
* **Vibe:** Espaços em branco, fontes Sans-serif modernas e transições suaves (fade-in).

## 2. Componentes Principais
* **Product Card:** - Foto em destaque (proporção 1:1).
    - Badge de "Disponível".
    - Preços: "De: R$ 00" (riscado) e "Por: R$ 00" (bold na cor da marca).
* **Smart Grid:** - Desktop: 4 colunas.
    - Mobile: 2 colunas fixas.
    - Especial: Se houver apenas 1 item na marca, ele expande para 100% da largura.

## 3. Whitelabel Tokens
Os componentes devem consumir variáveis CSS injetadas:
* `--primary`: Cor principal do lojista.
* `--radius`: Arredondamento dos botões e cards.
* `--font-main`: Fonte escolhida no CMS.

## 4. Estados de Interface
* **Skeleton Screens:** Placeholder cinza animado durante o carregamento das imagens.
* **WhatsApp Trigger:** Botão flutuante ou fixo no card com ícone do WhatsApp e label "Pedir Agora".