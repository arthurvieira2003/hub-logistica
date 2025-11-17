module.exports = {
  process(sourceText, sourcePath, options) {
    const isPublicJsFile = sourcePath.includes("public/javascripts");
    const isTestFile =
      sourcePath.includes("__tests__") ||
      sourcePath.includes(".test.") ||
      sourcePath.includes(".spec.");

    if (isPublicJsFile && !isTestFile) {
      return {
        code: `
          (function(window, document, global) {
            ${sourceText}
          })(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : {}, global);
        `,
      };
    }

    return {
      code: sourceText,
    };
  },
};
