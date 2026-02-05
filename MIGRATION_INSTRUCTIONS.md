# 🚀 Instruções para Migração do Banco de Dados

O campo `catalogConfig` foi adicionado ao schema do Prisma, mas você precisa executar a migração para atualizar o banco de dados.

## ⚡ Executar Migração

Execute o seguinte comando na raiz do projeto:

```bash
npx prisma migrate dev --name add-catalog-config
```

## 🔍 O que esse comando faz:

1. Cria uma nova migração SQL
2. Adiciona a coluna `catalogConfig` (tipo JSON) na tabela `Tenant`
3. Atualiza o Prisma Client
4. Aplica as mudanças no banco de dados

## ✅ Verificação

Após executar a migração, teste:

1. Acesse `/customize` no admin
2. Configure o visual
3. Clique em "Salvar"
4. Verifique se não há mais erro

## 🐛 Se der erro:

**Erro: "Unknown field catalogConfig"**
- Solução: Execute `npx prisma generate` e depois a migração

**Erro: "Database connection failed"**
- Solução: Verifique se o PostgreSQL está rodando
- Verifique a variável `DATABASE_URL` no `.env`

**Erro: "Migration failed"**
- Solução:
  ```bash
  npx prisma migrate reset
  npx prisma migrate dev --name add-catalog-config
  ```
  ⚠️ **ATENÇÃO**: Isso apaga todos os dados! Use apenas em desenvolvimento.

## 📋 Alterações no Schema

```prisma
model Tenant {
  // ... campos existentes ...

  /// Catalog customization configuration (JSON)
  catalogConfig Json?

  // ... resto do modelo ...
}
```

## 🎨 Após a Migração

A funcionalidade de personalização estará 100% funcional com:
- ✅ Templates pré-prontos
- ✅ 4 estilos de header
- ✅ Personalização de cores, layout e tipografia
- ✅ Preview em tempo real
- ✅ Responsividade mobile completa
