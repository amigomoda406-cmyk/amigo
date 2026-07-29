import Link from 'next/link';

export default function CategoriesSection() {
  return (
    <section id="categories" className="bg-white border-b border-zinc-200 scroll-mt-[50px]">
      <div className="grid grid-cols-3 gap-0.5">
        <Link href="/category/clothes" className="relative aspect-[4/5] md:aspect-square overflow-hidden group cursor-pointer bg-zinc-100">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://res.cloudinary.com/doxg77zqk/image/upload/v1785165210/Change_writing_to_hoodie_2K_202607271601.jpg')"}} />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <span className="absolute bottom-2 md:bottom-6 left-0 right-0 text-center text-[7px] md:text-sm font-black text-white tracking-widest uppercase drop-shadow-md">Vêtement</span>
        </Link>
        <Link href="/category/shoes" className="relative aspect-[4/5] md:aspect-square overflow-hidden group cursor-pointer bg-zinc-100">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://res.cloudinary.com/doxg77zqk/image/upload/v1785165180/%D8%BA%D9%8A%D8%B1_%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85_%D8%A7%D9%84%D9%85%D9%88%D8%AC%D9%88%D8%AF_%D9%88%D8%B1%D8%A7_%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC_202607271601.jpg')"}} />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <span className="absolute bottom-2 md:bottom-6 left-0 right-0 text-center text-[7px] md:text-sm font-black text-white tracking-widest uppercase drop-shadow-md">SHOES</span>
        </Link>
        <Link href="/category/accessories" className="relative aspect-[4/5] md:aspect-square overflow-hidden group cursor-pointer bg-zinc-100">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://res.cloudinary.com/doxg77zqk/image/upload/v1785165156/Move_accessories_up_2K_202607271606.jpg')"}} />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <span className="absolute bottom-2 md:bottom-6 left-0 right-0 text-center text-[7px] md:text-sm font-black text-white tracking-widest uppercase drop-shadow-md">ACCESSORIES</span>
        </Link>
      </div>
    </section>
  );
}
