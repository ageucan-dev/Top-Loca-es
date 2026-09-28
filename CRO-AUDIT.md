# Auditoria CRO — Top Locações

Data da análise: 07/09/2026  
Período dos relatórios: 01/06/2026 a 07/09/2026 (GA4) e 10/06/2026 a 07/09/2026 (Clarity)  
Escopo da primeira versão: somente hipóteses P0 e P1, com prioridade para celular.

## Resumo executivo

O principal gargalo está antes da primeira decisão comercial. No celular, 57,9% dos toques registrados acontecem no Hero, mas apenas 4,1% dos toques totais chegam aos dois CTAs desse bloco. H1, subtítulo e imagem concentram 549 toques (36,0%), enquanto a imagem promocional contém visualmente a chamada “Solicite seu orçamento” sem funcionar como ação.

O mapa de scroll reforça o problema: 530 visitantes chegaram a 5% da página, mas somente 259 chegaram a 10%, uma queda de 51,1%. Apenas 136 chegaram a 50% (25,7% da base de 5%) e 19 chegaram ao final (3,6%). Por isso, produtos e formulário não podem permanecer dependentes do fim da página.

## Evidências principais

| Evidência | Dado observado | Leitura para CRO |
| --- | ---: | --- |
| Atenção concentrada no Hero | 882 de 1.524 toques (57,9%) | O primeiro bloco concentra intenção, mas distribui mal os caminhos de ação. |
| Toques em H1 + subtítulo + imagem | 549 toques (36,0%) | Há tentativa de interação em áreas de alta atenção; não se deve linkar os textos, mas aproximar e tornar claros os CTAs. |
| CTAs atuais do Hero | 63 toques (4,1%) | A ação comercial perde competição visual para conteúdo estático e para a própria arte promocional. |
| Imagens dos produtos | 31 toques | As imagens têm expectativa de ação; precisam de affordance e destino coerente. |
| CTAs dos cards de produto | 15 toques | O caminho atual para detalhes recebe menos interação do que as imagens. |
| Queda entre 5% e 10% | 530 → 259 visitantes (-51,1%) | A decisão precisa aparecer antes e o Hero mobile deve ocupar menos altura. |
| Alcance de 50% da página | 136 visitantes | Somente 25,7% dos visitantes da faixa de 5% chegam à metade da página. |
| Alcance de 100% da página | 19 visitantes | O formulário no final não pode ser o único caminho de conversão. |
| Formulário | 127 toques; 90 em campos; 16 no envio | Existe início de interação, porém o dado é de toques, não de usuários; não permite calcular abandono exato. |
| Paid Search | 55,8% de engajamento; 44 s médios; 6,33 eventos/sessão | É o tráfego de maior intenção entre os canais pagos analisados e deve encontrar a escolha de produto rapidamente. |
| Display | 38,7% de engajamento; 30 s médios; 5,07 eventos/sessão | Tráfego mais frio precisa de proposta, confiança e próximo passo muito claros. |
| Páginas de produto | 98 visualizações no elétrico; 27 no manual | As rotas têm demanda e devem continuar preservadas como caminhos de intenção e SEO. |

## Hipóteses priorizadas

| Prioridade | Problema | Evidência | Hipótese / alteração | Impacto esperado | Risco e controle |
| --- | --- | --- | --- | --- | --- |
| P0 | Hero mobile excessivamente alto | CSS usa `min-height: 940px`; queda de 51,1% entre 5% e 10% | Remover a altura mínima no mobile e compactar espaçamentos, sem trocar conteúdo ou identidade | Mais visitantes alcançando a próxima decisão; melhora do scroll a 10% e 25% | Risco de compressão visual; validar de 320 px a 768 px e manter desktop intacto |
| P0 | CTA perde atenção para elementos estáticos | 549 toques em H1, subtítulo e imagem contra 63 nos CTAs | Aumentar área e contraste do CTA principal no mobile; manter CTA secundário com hierarquia inferior | Aumento da taxa de clique no CTA do Hero | Evitar competir com dois CTAs primários |
| P0 | Arte do Hero parece clicável, mas não é | 97 toques; a própria imagem diz “Solicite seu orçamento” | Transformar a área da imagem em um botão acessível que conduz ao formulário | Converter intenção já existente em avanço real no funil | Manter foco visível, teclado e sem transformar H1/H2 em links |
| P0 | Produtos aparecem tarde | Forte abandono inicial; intenção de busca por tipo de balancim | Mover a seleção Elétrico/Manual para logo após uma prova rápida | Mais usuários identificando o modelo antes de abandonar | Preservar ambas as rotas e links de detalhes |
| P0 | Formulário depende do final da página | Só 3,6% da base de 5% chega ao fim | Reposicionar o mesmo formulário logo após os produtos | Mais visualizações e inícios de formulário | Não duplicar formulário nem alterar Firebase/validação |
| P1 | Não existe caminho persistente no celular | Baixa interação com CTAs e grande queda de scroll | Adicionar CTA inferior fixo, respeitando safe-area e ocultando quando o formulário estiver visível | Aumentar acesso ao formulário ao longo da navegação | Não cobrir conteúdo; limitar ao mobile |
| P1 | Imagens de produto recebem mais toques que os CTAs | 31 toques em imagens contra 15 nos CTAs | Adicionar botão semântico sobre a imagem e CTA “Orçar este modelo”; manter “Ver detalhes” | Capturar intenção de orçamento e preservar a pesquisa técnica | Evitar tornar todo conteúdo do card um link ambíguo |
| P1 | Produto já escolhido é solicitado novamente | Cards e páginas indicam Elétrico/Manual, mas o select começa vazio | Pré-selecionar o produto no formulário após clique e nas páginas específicas | Menos fricção e menos erro de preenchimento | Disparar o evento nativo de mudança para manter o estado React correto |
| P1 | Prova social aparece tarde | Dados de confiança existem, mas ficam depois de conteúdo institucional | Criar faixa curta com dados já existentes e trazer avaliações antes dos blocos secundários | Redução de objeção antes da captura | Não inventar números nem duplicar afirmações conflitantes |
| P1 | Conteúdo SEO interrompe o fluxo comercial | Bloco textual aparece antes dos produtos | Mover o mesmo bloco para o fim da Home | Fluxo mais direto sem perda de conteúdo indexável | Preservar headings, links e texto no DOM |
| P1 | Medição não separa os principais passos | Conversão final existe, mas não há camada CRO explícita | Enviar eventos ao `dataLayer` para CTAs, produto, formulário, erro e sucesso real | Permitir medir onde o ganho ou perda acontece | Nunca enviar PII nem marcar lead antes da confirmação em `/obrigado` |

## Itens não implementados nesta rodada

| Prioridade | Hipótese futura | Motivo para aguardar |
| --- | --- | --- |
| P2 | Tornar e-mail opcional | A validação e o contrato de dados estão dentro do bundle compilado. Alterar por contorno externo pode degradar o banco de leads; testar somente com o projeto-fonte. |
| P2 | Reduzir campos ou criar formulário em etapas | Exige validação comercial sobre quais dados realmente qualificam o lead e teste controlado. |
| P2 | Trocar ou reescrever a oferta do Hero | A mensagem já responde produto e região; primeiro deve-se isolar o efeito de hierarquia e acesso à ação. |
| P3 | Teste A/B da ordem prova × produtos | A amostra atual orienta a primeira hipótese, mas a escolha final deve ser baseada em dados pós-publicação. |
| P3 | Alterar GA4 direto × GA4 via GTM | O HTML contém `gtag` direto e GTM. Isso deve ser verificado no Tag Assistant e no DebugView antes de qualquer remoção. |

## Escopo técnico protegido

- Rotas `/`, `/balancim-eletrico`, `/balancim-manual` e `/obrigado`.
- Firebase, coleção `leads`, validações e redirecionamento de sucesso.
- GA4 `G-61HWDM25QB` e GTM `GTM-PNSR7W84`.
- Metadados, canonical, FAQ estruturado, sitemap e robots.
- Imagens WebP/AVIF, PDFs, `.htaccess` e comportamento SPA.
- Identidade preta, branca, cinza e amarelo-mostarda.

## Métricas de validação pós-publicação

Comparar baseline e versão CRO por dispositivo e canal, com destaque para Paid Search e Display:

1. clique no CTA do Hero;
2. clique no CTA fixo mobile;
3. seleção de Elétrico e Manual;
4. scroll a 10%, 25% e 50%;
5. visualização e início do formulário;
6. tentativas, erros e envios confirmados;
7. usuários que chegam a `/obrigado`;
8. conversão mobile e sessões por lead;
9. CPL por campanha/canal;
10. leads qualificados e ROI, que permanecem como critérios finais.
