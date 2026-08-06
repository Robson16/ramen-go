import './globals.css'

import type { Metadata } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'

const mPlusRounded1c = M_PLUS_Rounded_1c({
  variable: '--font-m-plus-rounded-1c',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ramen Go!',
  description:
    'Bem-vindo ao RamenGo! Uma aplicação web simples e elegante para pedir seu lámen favorito online.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={mPlusRounded1c.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
