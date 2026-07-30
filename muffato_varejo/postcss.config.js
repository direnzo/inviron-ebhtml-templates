module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')({
      // Configuração MÁXIMA compatibilidade — WebKit legado Android 7+
      overrideBrowserslist: [
        "Chrome >= 65",      // Chromium 65 = Android 7 WebView
        "Safari >= 10",      // forçar webkit
        "iOS >= 10",         // forçar webkit
        "Android >= 7",      // Android 7+
        "last 2 ChromeAndroid versions",
        "last 2 Chrome versions",
        "> 0.5%",
        "not dead"
      ],
      flexbox: "no-2009",  // suporte a flexbox antigo e novo
      remove: false,        // nunca remove prefixos antigos
      cascade: true,
      add: true,
      supports: false,      // evita @supports queries
    })
  ]
}
