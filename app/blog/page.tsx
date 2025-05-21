// `app/blog/page.tsx` is the UI for the `/blog` URL
export default function Page() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Blog
        </h1>
        <p className="max-w-[700px] text-lg">
          Welcome to the blog! We&apos;ve recently updated our homepage with an exciting new feature: 
          you can now rate the useless facts! Check it out on the <a href="/" className="underline">homepage</a> and let us know what you think of the facts.
        </p>
      </div>
    </section>
  )
}
