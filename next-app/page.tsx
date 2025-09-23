// next-app/app/page.tsx
import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* ハイライトへ飛べるよう id を付与（#/highlights でスクロール） */}
      <section id="highlights" className="relative min-h-[70vh] overflow-hidden">
        {/* basePath を自動考慮してくれる */}
        <Image
          src="/img/hero-cheese.jpg"
          alt="CHEESE WONDERLAND"
          fill
          priority
          className="object-cover"
        />
        {/* 暗すぎる場合は /10 の数字をさらに下げる（例: /5） */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
          <h1 className="text-4xl md:text-6xl font-bold">
            とろける非日常がひと晩だけオープン。
          </h1>
          {/* ここにカウントダウン等の要素を配置 */}
        </div>
      </section>
    </main>
  );
}
