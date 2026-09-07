# Changelog CRO — Top Locações

Data: 07/09/2026  
Versão: `mobile-conversion-v1`  
Branch: `cro/mobile-conversion-v1`

## Objetivo

Aumentar a taxa de conversão do tráfego existente sem reconstruir o site, preservando identidade visual, rotas, SEO, Firebase e rastreamento atual. A primeira rodada concentra somente hipóteses P0/P1, com prioridade para celular.

## Base de comparação

- Baseline: commit `3f72313239eee91c6d6d89a32cd39fd6f806ded1` — `chore: baseline site Top Locações antes do CRO`.
- Primeira implementação CRO: commit `3d6ac8061d60bba470da5f30e4c9aca6f6925e94` — `feat: optimize mobile conversion flow`.
- Evidência principal: forte concentração de toques no Hero e queda de 51,1% entre 5% e 10% de scroll no mobile.

## Alterações implementadas

### 1. Hero mobile compactado

- Removido o efeito prático do `min-height: 940px` no mobile por sobrescrita CSS.
- Reduzidos paddings, gaps e dimensões excessivas.
- CTA principal ganhou maior presença visual.
- CTA principal renomeado para `Solicitar orçamento`.
- CTA secundário renomeado para `Escolher balancim`.
- Microbenefícios permanecem, porém depois dos CTAs na hierarquia visual.

**Hipótese:** mais usuários alcançarão produtos e formulário antes de abandonar a página.

### 2. Arte principal transformada em caminho de conversão

- A imagem do Hero, que já concentra toques e apresenta visualmente uma chamada de orçamento, recebeu uma camada de botão acessível.
- Clique conduz ao formulário original.
- Evento enviado ao `dataLayer` como `cro_cta_click` com origem `hero_image`.

**Hipótese:** converter parte dos cliques atualmente mortos em avanço real no funil.

### 3. Nova ordem da Home

A Home passa a seguir esta hierarquia:

1. Hero
2. Prova rápida
3. Seleção de produtos
4. Formulário original
5. Prova social / depoimentos
6. Proposta de valor
7. Diferenciais
8. Benefícios / aplicações
9. FAQ
10. Conteúdo SEO

Nenhum desses blocos foi removido. O conteúdo SEO foi apenas deslocado para depois do fluxo comercial principal.

### 4. Prova rápida acima da escolha do equipamento

Foi criada uma faixa curta com dados já existentes no site:

- 8 anos de mercado;
- +800 obras entregues;
- equipamentos revisados.

Os números duplicados dentro da prova social inferior são ocultados somente na Home CRO para evitar repetição visual; os depoimentos continuam preservados.

### 5. Cards de Balancim Elétrico e Manual

- As imagens agora possuem ação explícita `Orçar este modelo`.
- Foi adicionado CTA principal `Solicitar orçamento` em cada card.
- O link original para as páginas técnicas foi preservado como `Ver detalhes`.
- A seleção do modelo alimenta o formulário antes do scroll.

**Hipótese:** reduzir a distância entre intenção de produto e pedido de orçamento sem eliminar as rotas de SEO/intenção.

### 6. Pré-seleção do produto no formulário

- Clique em Balancim Elétrico seleciona `Balancim elétrico`.
- Clique em Balancim Manual seleciona `Balancim manual`.
- Nas rotas `/balancim-eletrico` e `/balancim-manual`, o produto correspondente é pré-selecionado automaticamente.
- A implementação dispara o evento nativo de `change` para preservar o estado controlado pelo React.

**Hipótese:** evitar que o usuário informe novamente uma decisão já tomada.

### 7. Formulário aproximado da intenção

- O mesmo `#product-form` foi movido para logo depois da escolha dos produtos na Home.
- Firebase, validações, campos obrigatórios e redirecionamento para `/obrigado` não foram alterados.
- Não foi criado formulário duplicado.
- Foram adicionados atributos de autocomplete/inputmode para melhorar preenchimento em celular.

### 8. CTA fixo no mobile

- Adicionado botão fixo `Solicitar orçamento` em telas de até 768 px.
- Respeita `safe-area`.
- É ocultado automaticamente enquanto o formulário estiver visível.
- Não é exibido em `/obrigado`.

### 9. Instrumentação CRO

Eventos adicionados ao `dataLayer`:

- `cro_cta_click`
- `cro_product_selected`
- `cro_product_details_click`
- `cro_form_view`
- `cro_form_start`
- `cro_form_field_completed`
- `cro_form_submit_attempt`
- `cro_form_validation_error`
- `cro_form_submit_error`
- `cro_lead_submit_success`

Nenhuma informação pessoal é enviada nesses eventos.

O sucesso do lead só é registrado após chegada a `/obrigado` dentro da janela de confirmação da tentativa de envio.

## Arquivos alterados/adicionados

- `index.html` — inclusão da camada `cro-v1.css` e `cro-v1.js`.
- `assets/cro-v1.css` — ajustes visuais e responsivos P0/P1.
- `assets/cro-v1.js` — reorganização, interações, pré-seleção e tracking CRO.
- `CRO-AUDIT.md` — auditoria e priorização.
- `README.md` — instrução de validação no Codespaces.
- `CRO-CHANGELOG.md` — documentação desta versão.

## Estrutura preservada

Foi confirmado no bundle original que permanecem intactos:

- rotas `/`, `/balancim-eletrico`, `/balancim-manual` e `/obrigado`;
- formulário original e coleção Firebase `leads`;
- valores aceitos pelo formulário: `Balancim elétrico` e `Balancim manual`;
- validações de nome, e-mail, telefone, cidade, perfil, produto e quantidade;
- GA4 `G-61HWDM25QB`;
- GTM `GTM-PNSR7W84`;
- `.htaccess` e fallback SPA da hospedagem;
- sitemap, robots e páginas de produto;
- assets WebP/AVIF e PDFs;
- identidade visual atual.

## Validações técnicas já realizadas

- Confirmada existência dos seletores usados pela camada CRO no bundle original.
- Confirmado que os wrappers de imagem possuem `position: relative`, permitindo overlays sem alterar o layout-base.
- Confirmado que `select[name="product"]` usa exatamente os valores empregados pela pré-seleção.
- Confirmado que o formulário salva no Firebase e redireciona para `/obrigado` após sucesso.
- Confirmado que o erro de envio é renderizado dentro do formulário e pode ser observado pela camada de tracking.
- Confirmado que `main` permanece como baseline e a alteração está isolada em `cro/mobile-conversion-v1`.

## Validação visual ainda necessária no Codespaces

Antes de levar qualquer arquivo à Hostinger, validar manualmente:

- Home em 320, 360, 375, 390, 414, 430 e 768 px;
- desktop;
- CTA principal do Hero;
- CTA secundário do Hero;
- clique na arte principal;
- Balancim Elétrico → pré-seleção + formulário;
- Balancim Manual → pré-seleção + formulário;
- sticky CTA mobile e ocultação sobre o formulário;
- navegação para `Ver detalhes`;
- `/balancim-eletrico` e `/balancim-manual`;
- envio de formulário de teste em ambiente apropriado;
- redirecionamento para `/obrigado`;
- eventos no `dataLayer`/GTM Preview;
- ausência de regressões em menu, FAQ, depoimentos, downloads e layout.

## Como abrir no Codespaces

Na raiz da branch `cro/mobile-conversion-v1`:

```bash
python3 -m http.server 5173
```

Depois abra a porta `5173` na aba **Ports**.

Observação: no servidor Python, valide rotas internas navegando pelos links do próprio SPA. O refresh direto em uma rota interna pode retornar 404 localmente; na Hostinger o fallback permanece atendido pelo `.htaccess` original.

## Métricas pós-publicação

Comparar baseline × CRO, principalmente em mobile e Paid Search:

- CTR do CTA do Hero;
- cliques na arte do Hero;
- CTR do sticky CTA;
- seleção Elétrico/Manual;
- scroll 10%, 25% e 50%;
- visualização do formulário;
- início do formulário;
- tentativa e sucesso de envio;
- usuários em `/obrigado`;
- taxa de conversão mobile;
- sessões por lead;
- CPL;
- leads qualificados;
- ROI real.

## Status

**Implementação P0/P1 pronta para validação visual no Codespaces.**  
**Ainda não publicar na Hostinger antes dessa validação.**
