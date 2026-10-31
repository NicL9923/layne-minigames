import { CheckoutGame } from './games/checkout/CheckoutGame'

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Layne Minigames home">
          <img src="/layne-mark.svg" alt="" />
          <span>Layne Minigames</span>
        </a>
        <a className="header-link" href="#games">
          Games
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Play · learn · smile</p>
            <h1>Little games for big imaginations.</h1>
            <p className="hero-intro">
              Pick a game, practice a skill, and have fun along the way. No
              account needed.
            </p>
            <a className="primary-link" href="#checkout">
              Play Checkout
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="hero-emoji hero-emoji-cart">🛒</span>
            <span className="hero-emoji hero-emoji-apple">🍎</span>
            <span className="hero-emoji hero-emoji-star">⭐</span>
          </div>
        </section>

        <section className="game-library" id="games" aria-labelledby="games-title">
          <div>
            <p className="eyebrow">Game shelf</p>
            <h2 id="games-title">Choose a game</h2>
          </div>
          <a className="game-card" href="#checkout">
            <span className="game-card-icon" aria-hidden="true">
              🧾
            </span>
            <span>
              <strong>Checkout</strong>
              <small>Run a pretend grocery register</small>
            </span>
            <span className="game-card-status">Play now</span>
          </a>
        </section>

        <CheckoutGame />
      </main>

      <footer>
        <img src="/layne-mark.svg" alt="" />
        <span>Layne Minigames · Made for playtime.</span>
      </footer>
    </div>
  )
}
export default App
