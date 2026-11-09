// Drawn with CSS only: no image to download, so the products below still load first.
export function HomeHero() {
  return (
    <section className="relative mb-5 overflow-hidden rounded-lg bg-black px-4 py-4 text-white sm:px-8 sm:py-7">
      <div aria-hidden="true" className="absolute inset-y-0 -right-6 flex -skew-x-[18deg] gap-1.5 sm:right-6 sm:gap-2.5">
        <span className="w-10 bg-accent sm:w-28" />
        <span className="w-4 bg-accent sm:w-10" />
        <span className="hidden w-4 bg-accent sm:block" />
      </div>
      <div className="relative pr-10 sm:pr-64">
        <h1 className="text-lg font-bold sm:text-3xl">ყველაფერი შენი მოპედისთვის</h1>
        <p className="mt-1 hidden text-neutral-300 sm:block">გრიფსები, დამტენები, ხელთათმანები და სხვა აქსესუარები</p>
      </div>
    </section>
  );
}
