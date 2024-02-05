import Link from 'next/link'
import { Logo } from 'src/components/Logo'

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="py-6 px-4 flex justify-between space-x-8 border-b-4 border-zinc-200/50">
        <Logo />
      </header>

      <section className="max-w-7xl px-4">
        <h1 className="text-center my-8 text-zinc-600 text-xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed">
          What language are you studying today?
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 text-center">
          <Link
            className="card bg-zinc-100 hover:bg-zinc-200/80 transition ease-in-out duration-200 p-4 rounded-lg no-underline hover:ring-2 ring-emerald-400/80"
            href={`/zh`}
          >
            <div className="card-body space-y-4">
              <h3 className="text-2xl font-semibold flex justify-center items-center py-5">
                Chinese (traditional)
              </h3>
              <div className="mt-10 rounded-md bg-white py-2 px-4">Start</div>
            </div>
          </Link>
          <Link
            className="card bg-zinc-100 hover:bg-zinc-200/80 transition ease-in-out duration-200 p-4 rounded-lg no-underline hover:ring-2 ring-emerald-400/80"
            href={`/de`}
          >
            <div className="card-body space-y-4">
              <h3 className="text-2xl font-semibold flex justify-center items-center py-5">
                German
              </h3>
              <div className="mt-10 rounded-md bg-white py-2 px-4">Start</div>
            </div>
          </Link>
          <Link
            className="card bg-zinc-100 hover:bg-zinc-200/80 transition ease-in-out duration-200 p-4 rounded-lg no-underline hover:ring-2 ring-emerald-400/80"
            href={`/ja`}
          >
            <div className="card-body space-y-4">
              <h3 className="text-2xl font-semibold flex justify-center items-center py-5">
                Japanese
              </h3>
              <div className="mt-10 rounded-md bg-white py-2 px-4">Start</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
