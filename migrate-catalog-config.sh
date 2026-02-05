#!/bin/bash

# =============================================================================
# Script de Migração - Adicionar catalogConfig
# =============================================================================

echo "🚀 Iniciando migração do banco de dados..."
echo ""

# Verificar se o Prisma está instalado
if ! command -v npx &> /dev/null; then
    echo "❌ Erro: Node.js/npx não encontrado"
    echo "   Instale o Node.js primeiro"
    exit 1
fi

echo "📦 Gerando Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Executando migração..."
npx prisma migrate dev --name add-catalog-config

echo ""
echo "✅ Migração concluída!"
echo ""
echo "🎨 Próximos passos:"
echo "   1. Reinicie o servidor de desenvolvimento"
echo "   2. Acesse /customize no admin"
echo "   3. Configure o visual da sua loja"
echo "   4. Salve e veja as mudanças aplicadas!"
echo ""
