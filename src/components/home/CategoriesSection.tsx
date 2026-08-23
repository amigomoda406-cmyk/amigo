import Link from 'next/link';

type Category = {
  _id: string;
  title: string;
  slug: { current: string };
  imageUrl?: string;
};

export default function CategoriesSection({ categories = [] }: { categories?: Category[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section id="categories" className="bg-white border-b border-zinc-200 scroll-mt-[50px]">
      <div className="grid grid-cols-3 gap-0.5">
        {categories.slice(0, 3).map((cat) => {
          const imageUrl = cat.imageUrl || '';
          return (
            <Link
              key={cat._id}
              href={`/category/${cat.slug.current}`}
              className="relative aspect-[4/5] md:aspect-square overflow-hidden group cursor-pointer bg-zinc-100"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <span className="absolute bottom-2 md:bottom-6 left-0 right-0 text-center text-[7px] md:text-sm font-black text-white tracking-widest uppercase drop-shadow-md">
                {cat.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
