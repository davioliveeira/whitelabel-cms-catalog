#!/bin/bash
echo "🖼️  Updating Properar Perfumaria images..."
npx tsx prisma/seeds/update-properar-images.seed.ts
