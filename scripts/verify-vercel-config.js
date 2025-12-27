#!/usr/bin/env node

/**
 * Script de vérification de la configuration Vercel
 * Vérifie que toutes les variables d'environnement nécessaires sont définies
 */

require('dotenv').config();

const requiredVars = [
    'GOOGLE_AI_API_KEY'
];

const optionalVars = [
    'GEMINI_API_KEY',
    'AI_API_KEY',
    'DATABASE_URL',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'FRONTEND_URL',
    'AI_TIMEOUT'
];

console.log('🔍 Vérification de la configuration Vercel...\n');

let hasErrors = false;
let hasWarnings = false;

// Vérifier les variables requises
console.log('📋 Variables Requises:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`  ✅ ${varName}: ${value.substring(0, 10)}...${value.slice(-4)}`);
    } else {
        console.log(`  ❌ ${varName}: NON DÉFINIE`);
        hasErrors = true;
    }
});

// Vérifier les variables optionnelles
console.log('\n📋 Variables Optionnelles:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`  ✅ ${varName}: Définie`);
    } else {
        console.log(`  ⚠️  ${varName}: Non définie (optionnelle)`);
        hasWarnings = true;
    }
});

// Vérifier la clé API Google
console.log('\n🔑 Vérification de la Clé API Google:');
const googleKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
if (googleKey) {
    if (googleKey.startsWith('AIza')) {
        console.log(`  ✅ Clé API Google détectée: ${googleKey.substring(0, 10)}...${googleKey.slice(-4)}`);
    } else {
        console.log(`  ⚠️  Clé API ne commence pas par "AIza" - Vérifiez que c'est une clé Google valide`);
        hasWarnings = true;
    }
} else {
    console.log(`  ❌ Aucune clé API Google trouvée`);
    hasErrors = true;
}

// Résumé
console.log('\n📊 Résumé:');
if (hasErrors) {
    console.log('  ❌ ERREURS: Certaines variables requises sont manquantes');
    console.log('  → Ajoutez les variables manquantes dans Vercel Dashboard');
    process.exit(1);
} else if (hasWarnings) {
    console.log('  ⚠️  AVERTISSEMENTS: Certaines variables optionnelles sont manquantes');
    console.log('  → Le système fonctionnera mais certaines fonctionnalités peuvent être limitées');
    process.exit(0);
} else {
    console.log('  ✅ Configuration complète et correcte !');
    process.exit(0);
}
