# Top Locações — validação CRO

Esta branch mantém o site estático usado na Hostinger e adiciona somente a camada de otimização CRO documentada em `CRO-AUDIT.md` e `CRO-CHANGELOG.md`.

## Abrir no GitHub Codespaces

No terminal, na raiz do repositório, execute:

```bash
python3 -m http.server 5173
```

Depois, abra a porta **5173** pela aba **Ports** do Codespaces.

Para validar as rotas internas, navegue pelos links do próprio site. Em produção, o fallback de rotas continua sendo feito pelo `.htaccess` já existente.
