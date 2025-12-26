/**
 * Script pour nettoyer tous les prompts des références techniques
 * Retire: nombres de modèles, pourcentages, termes techniques, "addictif", "algorithme"
 */

const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, '../prompts');
const files = ['jobboat.json', 'ai.json', 'technology.json', 'general.json', 'mission.json', 'contact.json', 'outwings.json'];

// Patterns à remplacer
const replacements = [
    // Nombres de modèles
    { pattern: /572 modèles comportementaux/gi, replacement: 'une compréhension approfondie' },
    { pattern: /105 personas IA/gi, replacement: 'un accompagnement personnalisé' },
    { pattern: /7 modèles d'IA/gi, replacement: 'plusieurs systèmes' },
    { pattern: /7 modèles IA/gi, replacement: 'plusieurs systèmes' },
    { pattern: /14 systèmes différents/gi, replacement: 'plusieurs systèmes intégrés' },
    { pattern: /14 systèmes/gi, replacement: 'plusieurs systèmes' },
    
    // Pourcentages
    { pattern: /95% de précision/gi, replacement: 'une grande précision' },
    { pattern: /95%/gi, replacement: 'une grande précision' },
    { pattern: /70% des hallucinations/gi, replacement: 'les erreurs' },
    { pattern: /70%/gi, replacement: '' },
    
    // Termes techniques
    { pattern: /algorithme personnalisé/gi, replacement: 'contenu personnalisé' },
    { pattern: /algorithme/gi, replacement: 'système' },
    { pattern: /addictif/gi, replacement: 'engageant' },
    { pattern: /Selenium/gi, replacement: 'outils automatisés' },
    { pattern: /APIs ATS/gi, replacement: 'systèmes de recrutement' },
    { pattern: /API/gi, replacement: 'intégration' },
    { pattern: /150 APIs/gi, replacement: 'de nombreuses sources' },
    { pattern: /9 stratégies/gi, replacement: 'plusieurs méthodes' },
    { pattern: /architecture microservices/gi, replacement: 'architecture moderne' },
    { pattern: /Node\.js/gi, replacement: 'technologies modernes' },
    { pattern: /React Native/gi, replacement: 'technologies mobiles modernes' },
    { pattern: /Ollama/gi, replacement: 'nos systèmes' },
    { pattern: /vote démocratique/gi, replacement: 'système de validation' },
    { pattern: /système de vote démocratique/gi, replacement: 'système de validation' },
    
    // Autres termes
    { pattern: /mieux qu'ils ne se connaissent eux-mêmes/gi, replacement: 'en profondeur' },
];

function cleanFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Appliquer tous les remplacements
        replacements.forEach(({ pattern, replacement }) => {
            content = content.replace(pattern, replacement);
        });
        
        // Nettoyer les espaces multiples
        content = content.replace(/\s{2,}/g, ' ');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Nettoyé: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  Aucun changement: ${path.basename(filePath)}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erreur avec ${filePath}:`, error.message);
        return false;
    }
}

// Nettoyer tous les fichiers
console.log('🧹 Nettoyage des prompts...\n');
let cleaned = 0;

files.forEach(file => {
    const filePath = path.join(promptsDir, file);
    if (fs.existsSync(filePath)) {
        if (cleanFile(filePath)) {
            cleaned++;
        }
    } else {
        console.log(`⚠️  Fichier non trouvé: ${file}`);
    }
});

console.log(`\n✅ Nettoyage terminé: ${cleaned} fichier(s) modifié(s)`);
