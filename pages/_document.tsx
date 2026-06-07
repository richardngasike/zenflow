import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="description" content="ZenFlow - A mindful stress relief experience" />
        <meta name="theme-color" content="#f4f1eb" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
