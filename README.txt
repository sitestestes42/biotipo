SITE INTERATIVO DE DIAGNÓSTICO DE BIOTIPO CORPORAL
====================================================

📁 Estrutura do projeto:
- index.html          (página inicial com hero, depoimentos, FAQ)
- escolha.html        (escolha direta do biotipo)
- questionario.html   (questionário de 10 perguntas)
- resultado.html      (exibição do resultado)
- style.css           (estilos globais)
- script.js           (lógica de navegação suave, quiz e resultado)

🚀 Como usar:
1. Coloque todos os arquivos na mesma pasta.
2. Abra o index.html em um navegador moderno.
3. Navegue entre as páginas sem refresh completo (transições suaves).

🔧 Personalização:
- Altere o link da Kiwify no arquivo script.js (linha ~350), substituindo "SEU_LINK_AQUI" pelo seu link real.
- As perguntas do questionário estão no array "perguntas" no script.js.
- As cores e fontes podem ser ajustadas nas variáveis CSS no início do style.css.

📌 Observações:
- O site utiliza Font Awesome (CDN) para ícones e Google Fonts (Inter).
- É responsivo (mobile-first) e acessível (aria attributes, teclado).
- A barra de progresso e as animações estão incluídas.

💡 Dica: Para produção, considere hospedar em um servidor HTTPS para garantir o funcionamento correto dos recursos externos.