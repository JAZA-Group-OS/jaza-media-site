export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-brand-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(255, 202, 38, 0.04) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255, 202, 38, 0.04) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255, 202, 38, 0.04) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255, 202, 38, 0.04) 75%)
          `,
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0",
        }}
        aria-hidden
      />

      <div
        className="absolute top-0 bottom-0 left-0 hidden w-[26%] md:block lg:w-[30%]"
        style={{
          background:
            "linear-gradient(to right, rgba(55,55,55,0.95) 0%, rgba(40,40,40,0.7) 60%, rgba(24,24,24,0) 100%)",
        }}
        aria-label="Co-founder portrait placeholder"
      />
      <div
        className="absolute top-0 right-0 bottom-0 hidden w-[26%] md:block lg:w-[30%]"
        style={{
          background:
            "linear-gradient(to left, rgba(55,55,55,0.95) 0%, rgba(40,40,40,0.7) 60%, rgba(24,24,24,0) 100%)",
        }}
        aria-label="Co-founder portrait placeholder"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center md:py-24 lg:py-28">
        <h1 className="font-heading text-5xl leading-[1.05] font-black tracking-tight text-white md:text-6xl">
          DO YOU WANT TO
          <br />
          SCALE YOUR BUSINESS?
        </h1>
        <p className="mt-6 max-w-md text-xl text-neutral-300 md:text-2xl">
          Learn from the team that has scaled a portfolio to over ₱150m+ in annual revenue
        </p>
        <a
          href="#"
          className="mt-8 inline-flex items-center rounded-full bg-brand-yellow px-10 py-4 text-xl font-black tracking-wider text-brand-black transition-transform hover:scale-[1.02]"
        >
          LEARN TO SCALE
        </a>
      </div>
    </section>
  );
}
