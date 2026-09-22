module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')({
      // Configuração MÁXIMA compatibilidade para sistemas legados
      overrideBrowserslist: [
        "Chrome >= 4",       // Chrome bem antigo para forçar webkit
        "Safari >= 3.1",     // Safari bem antigo para forçar webkit  
        "iOS >= 3.2",        // iOS bem antigo para forçar webkit
        "Android >= 2.1",    // Android bem antigo para forçar webkit
        "IE >= 9",           // Internet Explorer 9+
        "Firefox >= 28",     // Firefox desde 2014
        "Opera >= 12.1",     // Opera desde 2012
        "> 0.001%",          // Navegadores com 0.001%+ de uso
        "not dead"           // Exclui apenas navegadores mortos
      ],
      // Configurações agressivas para máxima compatibilidade
      flexbox: "no-2009",   // Suporte a flexbox antigo e novo
      grid: "autoplace",    // Suporte a CSS Grid quando possível
      remove: false,        // NUNCA remove prefixos antigos
      cascade: true,        // Mantém formatação em cascata
      add: true,            // Força adicionar todos os prefixos necessários
      supports: false,      // Evita @supports queries para IE
    })
  ]
}