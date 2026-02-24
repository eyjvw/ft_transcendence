import { useState, useEffect } from 'react';
import type { User } from '../types/auth';

interface Game {
  id: string;
  name: string;
  image: string;
  players: number;
  background: string;
}

interface MainProps {
  user: User;
}

interface BetRow {
  id: string;
  game: string;
  user: string;
  time: string;
  amount: string;
  multiplier: string;
  payout: string;
  payoutPositive: boolean;
}

export default function Main({ user }: MainProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMode, setSelectedMode] = useState<'solo' | 'bot' | 'online' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentBets] = useState<BetRow[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const games: Game[] = [
    {
      id: 'blackjack',
      name: 'Blackjack',
      image: '/src/assets/blackjack.jpg',
      players: 2341,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    {
      id: 'dice',
      name: 'Dice',
      image: '/src/assets/dice.jpg',
      players: 2178,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    {
      id: 'mines',
      name: 'Mines',
      image: '/src/assets/mines.jpg',
      players: 2681,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    {
      id: "roulette",
      name: "Roulette",
      image: "/src/assets/roulette.jpg",
      players: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    }
  ];

  const filteredGames = games.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!mounted) {
    return null;
  }

  const openGameModal = (game: Game) => {
    setSelectedGame(game);
    setSelectedMode(null);
  };

  const closeGameModal = () => {
    setSelectedGame(null);
    setSelectedMode(null);
  };

  const launchGame = () => {
    if (!selectedGame || !selectedMode) {
      return;
    }
    // TODO: branch to the actual game route / lobby / socket flow
    // For now, just close the modal after mode selection.
    closeGameModal();
  };

  return (
    <div className="stake-container">
      <header className="stake-header">
        <div className="header-left">
          <h1 className="logo">ft_gambling</h1>
        </div>
        <div className="header-right">
          <button className="profile-btn" title="Aller au profil">
            {user.avatarUrl ? (
              <img className="profile-avatar" src={user.avatarUrl} alt={user.username} />
            ) : (
              <div className="profile-avatar placeholder">
                {user.username.slice(0, 1).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Cherchez votre jeu"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <section className="games-section">
        <div className="games-scroll">
          <div className="games-carousel">
            {filteredGames.map(game => (
              <div key={game.id} className="game-item">
                <div
                  className="game-card-stake"
                  style={{ background: game.background }}
                  onClick={() => openGameModal(game)}
                >
                  <img src={game.image} alt={game.name} loading="lazy" />
                </div>
                <p className="players-count">🟢 {game.players.toLocaleString()} joueurs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="activity-section">
        <div className="activity-card">
          <div className="activity-header">
            <h2>Paris récents</h2>
            <span className="activity-subtitle">Temps réel</span>
          </div>

          <div className="activity-table">
            <div className="activity-row activity-head">
              <div className="activity-cell">Jeu</div>
              <div className="activity-cell">Utilisateur</div>
              <div className="activity-cell">Temps</div>
              <div className="activity-cell">Montant du pari</div>
              <div className="activity-cell">Multiplicateur</div>
              <div className="activity-cell">Paiement</div>
            </div>

            {recentBets.length === 0 ? (
              <div className="activity-empty">En attente des données en temps réel…</div>
            ) : (
              recentBets.map((row) => (
                <div key={row.id} className="activity-row">
                  <div className="activity-cell">{row.game}</div>
                  <div className="activity-cell">{row.user}</div>
                  <div className="activity-cell activity-muted">{row.time}</div>
                  <div className="activity-cell">{row.amount}</div>
                  <div className="activity-cell activity-muted">{row.multiplier}</div>
                  <div className={`activity-cell ${row.payoutPositive ? 'activity-win' : 'activity-loss'}`}>
                    {row.payout}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {selectedGame && (
        <div className="modal-overlay" onClick={closeGameModal}>
          <div className="modal-stake" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeGameModal}>×</button>
            <div className="modal-info">
              <h2>{selectedGame.name}</h2>
              <p className="modal-players">{selectedGame.players.toLocaleString()} joueurs en ligne</p>
              <div className="mode-selector">
                <button
                  className={`mode-btn ${selectedMode === 'solo' ? 'active' : ''}`}
                  onClick={() => setSelectedMode('solo')}
                >
                  Solo
                </button>
                <button
                  className={`mode-btn ${selectedMode === 'bot' ? 'active' : ''}`}
                  onClick={() => setSelectedMode('bot')}
                >
                  Vs un bot
                </button>
                <button
                  className={`mode-btn ${selectedMode === 'online' ? 'active' : ''}`}
                  onClick={() => setSelectedMode('online')}
                >
                  Vs un joueur en ligne
                </button>
              </div>
              <button className="play-now-btn" onClick={launchGame} disabled={!selectedMode}>
                Lancer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .stake-container {
          min-height: 100vh;
          background-color: #0b1622;
          background-image:
            radial-gradient(circle at 15% 25%, rgba(64, 147, 238, 0.12), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(78, 196, 255, 0.08), transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(120, 115, 245, 0.08), transparent 35%),
            radial-gradient(circle at 80% 80%, rgba(50, 200, 180, 0.08), transparent 35%);
          color: #fff;
          padding: 0;
        }

        .stake-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(18, 29, 42, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px);
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .logo {
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #1a73e8, #66a9ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .profile-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .profile-btn:hover .profile-avatar {
          transform: scale(1.08);
          border-color: #66a9ff;
        }

        .profile-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .profile-avatar.placeholder {
          background: #3a4452;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }

        .search-bar {
          padding: 24px 40px;
        }

        .search-input {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: block;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
        }

        .search-input::placeholder {
          color: #888;
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(26, 115, 232, 0.7);
          box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.25);
        }

        .games-section {
          padding: 0 40px 40px 40px;
        }

        .activity-section {
          padding: 0 40px 60px 40px;
        }

        .activity-card {
          max-width: 1400px;
          margin: 0 auto;
          background: rgba(18, 29, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(14px);
        }

        .activity-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.25);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .activity-header h2 {
          margin: 0;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .activity-subtitle {
          color: rgba(231, 238, 247, 0.7);
          font-size: 12px;
          font-weight: 600;
        }

        .activity-table {
          display: flex;
          flex-direction: column;
        }

        .activity-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.4fr 1.2fr 1.4fr;
          gap: 12px;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 13px;
        }

        .activity-row:last-child {
          border-bottom: none;
        }

        .activity-head {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(231, 238, 247, 0.6);
          background: rgba(0, 0, 0, 0.25);
        }

        .activity-cell {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-muted {
          color: rgba(231, 238, 247, 0.6);
        }

        .activity-win {
          color: #3be089;
          font-weight: 700;
        }

        .activity-loss {
          color: #ff8a8a;
          font-weight: 700;
        }

        .activity-empty {
          padding: 20px;
          text-align: center;
          color: rgba(231, 238, 247, 0.6);
          font-size: 13px;
        }

        .games-scroll {
          overflow-x: auto;
          overflow-y: visible;
          padding-top: 10px;
          margin-top: -10px;
        }

        .games-carousel {
          display: flex;
          gap: 16px;
          overflow: visible;
          padding: 0;
          max-width: 1400px;
          margin: 0 auto;
          scroll-behavior: smooth;
          flex-wrap: wrap;
          justify-content: center;
        }

        .games-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .games-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .games-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .games-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }

        .game-item {
          width: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .game-card-stake {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 140px;
          height: 190px;
          transform: translateY(0);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        }

        .game-card-stake img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.35s ease;
        }

        .game-card-stake:hover {
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
          transform: translateY(-6px);
        }

        .game-card-stake:hover img {
          transform: scale(1.01);
        }

        .players-count {
          font-size: 11px;
          color: rgba(231, 238, 247, 0.7);
          margin: 0;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-align: center;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-stake {
          background: rgba(18, 29, 42, 0.95);
          border-radius: 16px;
          overflow: hidden;
          max-width: 420px;
          width: 100%;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
        }

        .modal-info {
          padding: 28px;
          text-align: center;
        }

        .modal-info h2 {
          font-size: 32px;
          margin: 0 0 12px 0;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .modal-players {
          color: rgba(231, 238, 247, 0.7);
          margin: 0 0 24px 0;
          font-size: 14px;
        }

        .play-now-btn {
          width: 100%;
          padding: 14px;
          background: #1a73e8;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .play-now-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .play-now-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 12px 32px rgba(26, 115, 232, 0.35);
        }

        .mode-selector {
          display: grid;
          gap: 12px;
          margin: 20px 0 24px 0;
        }

        .mode-btn {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #e7eef7;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .mode-btn:hover {
          border-color: rgba(26, 115, 232, 0.6);
          box-shadow: 0 10px 24px rgba(26, 115, 232, 0.2);
          transform: translateY(-2px);
        }

        .mode-btn.active {
          background: rgba(26, 115, 232, 0.2);
          border-color: rgba(26, 115, 232, 0.8);
          color: #ffffff;
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          color: #fff;
          font-size: 32px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          transition: all 0.3s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(26, 115, 232, 0.3);
          color: #8cc2ff;
        }

        @media (max-width: 768px) {
          .stake-header {
            padding: 16px 20px;
          }

          .search-bar,
          .games-section {
            padding-left: 20px;
            padding-right: 20px;
          }

          .logo {
            font-size: 20px;
          }

          .games-carousel {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 8px;
          }

          .game-card-stake {
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
}
