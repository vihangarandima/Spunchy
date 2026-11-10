import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-(--space-gutter) py-24 text-center">
      <div>
        <p className="punch text-[clamp(6rem,24vw,14rem)] text-maroon">404</p>
        <h1 className="text-h1 font-extrabold">This one sold out</h1>
        <p className="lede mt-3 text-ink/70">The page you were looking for isn’t in the cabinet.</p>
        <Link to="/menu" className="btn btn-maroon mt-8">
          Browse the menu
        </Link>
      </div>
    </div>
  )
}
