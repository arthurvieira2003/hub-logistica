/**
 * Transformer customizado do Jest para instrumentar arquivos JavaScript
 * Este transformer permite que o Jest instrumente arquivos carregados via require()
 */

module.exports = {
  process(sourceText, sourcePath, options) {
    // Verificar se é um arquivo que queremos instrumentar
    const isPublicJsFile = sourcePath.includes("public/javascripts");
    const isTestFile = sourcePath.includes("__tests__") || 
                       sourcePath.includes(".test.") || 
                       sourcePath.includes(".spec.");

    // Se for um arquivo público e não for teste, executar o código no contexto global
    // Isso permite que o Jest instrumente o código antes de executá-lo
    if (isPublicJsFile && !isTestFile) {
      // Retornar o código envolto em uma IIFE para manter o contexto global
      // O Jest irá instrumentar este código automaticamente
      return {
        code: `
          // Instrumentado pelo Jest para cobertura: ${sourcePath}
          (function(window, document, global) {
            ${sourceText}
          })(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : {}, global);
        `,
      };
    }

    // Para arquivos de teste e outros, retornar como está
    return {
      code: sourceText,
    };
  },
};
