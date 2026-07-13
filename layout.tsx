import "./globals.css";

export const metadata = {
  title: "애동제자의 사주풀이",
  description: "타고난 기질과 지금의 고민을 바탕으로 사주의 흐름을 차분히 풀어드립니다."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
