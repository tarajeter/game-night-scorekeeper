import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [roundScores, setRoundScores] = useState({});
  const [roundNumber, setRoundNumber] = useState(1);
  const [winningScore, setWinningScore] = useState(100);
  const [winner, setWinner] = useState(null);
  const [winMode, setWinMode] = useState("endOfRound");
  const [gamePhase, setGamePhase] = useState("setup");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [hasLoadedSavedGame, setHasLoadedSavedGame] = useState(false);
  const [showWinnerScreen, setShowWinnerScreen] = useState(false);

  useEffect(() => {
    const savedGame = localStorage.getItem("scorekeeperGame");

    if (savedGame) {
      const gameData = JSON.parse(savedGame);

      setPlayers(gameData.players || []);
      setRoundScores(gameData.roundScores || {});
      setRoundNumber(gameData.roundNumber || 1);
      setWinningScore(gameData.winningScore || 100);
      setWinner(gameData.winner || null);
      setWinMode(gameData.winMode || "endOfRound");
      setGamePhase(gameData.gamePhase || "setup");
    }

    setHasLoadedSavedGame(true);
  }, []);

  useEffect(() => {
    
    if (!hasLoadedSavedGame) return;

    const gameData = {
      players,
      roundScores,
      roundNumber,
      winningScore,
      winner,
      winMode,
      gamePhase,
    };

    localStorage.setItem("scorekeeperGame", JSON.stringify(gameData));
  }, [
    players,
    roundScores,
    roundNumber,
    winningScore,
    winner,
    winMode,
    gamePhase,
    hasLoadedSavedGame,
  ]);

  const addPlayer = () => {
    if (!playerName.trim()) return;

    const newPlayer = {
      id: Date.now(),
      name: playerName,
      scores: [],
    };

    setPlayers([...players, newPlayer]);
    setPlayerName("");
  };


  const updateRoundScore = (playerId, value) => {
    setRoundScores({
      ...roundScores,
      [playerId]: value,
    });
  };

  const submitRound = () => {
    const updatedPlayers = players.map((player) => {

      const scoreToAdd = Number(roundScores[player.id]) || 0;

      return {
        ...player,
        scores: [...player.scores, scoreToAdd],
      };
    });

    setPlayers(updatedPlayers);

   if (winMode === "endOfRound") {

  const possibleWinners = updatedPlayers.filter((player) => {

    const total = player.scores.reduce(
      (sum, score) => sum + score,
      0
    );

    return total >= winningScore;

  });

  if (possibleWinners.length > 0) {

    const highestScoringPlayer =
      possibleWinners.sort((a, b) => {

        const totalA = a.scores.reduce(
          (sum, score) => sum + score,
          0
        );

        const totalB = b.scores.reduce(
          (sum, score) => sum + score,
          0
        );

        return totalB - totalA;

      })[0];

    setWinner(highestScoringPlayer);
    setGamePhase("gameOver");
    setShowWinnerScreen(true);
  }
}

    setRoundScores({});

    setRoundNumber(roundNumber + 1);
  };

  const removePlayer = (playerId) => {
    setPlayers(players.filter((player) => player.id !== playerId));
  };

  const movePlayerUp = (index) => {

    if (index === 0) return;

    const updatedPlayers = [...players];

    [updatedPlayers[index - 1], updatedPlayers[index]] =
    [updatedPlayers[index], updatedPlayers[index - 1]];

    setPlayers(updatedPlayers);
  };

  const movePlayerDown = (index) => {

    if (index === players.length - 1) return;

    const updatedPlayers = [...players];

    [updatedPlayers[index + 1], updatedPlayers[index]] =
    [updatedPlayers[index], updatedPlayers[index + 1]];

    setPlayers(updatedPlayers);
  };

  const resetGame = () => {
    setPlayers([]);
    setRoundScores({});
    setRoundNumber(1);
    setWinner(null);
    setGamePhase("setup");
    setShowWinnerScreen(false);

    localStorage.removeItem("scorekeeperGame");
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const totalA = a.scores.reduce(
      (sum, score) => sum + score,
      0
    );

    const totalB = b.scores.reduce(
      (sum, score) => sum + score,
      0
    );

    return totalB - totalA;
  });

  const currentLeader = sortedPlayers[0];

  const selectedPlayer = players.find(
  (player) => player.id === selectedPlayerId
  );

  if (selectedPlayer) {
    const selectedTotal = selectedPlayer.scores.reduce(
      (sum, score) => sum + score,
      0
    );

    return (
      <div className="player-view">
        <button className="back-button" onClick={() => setSelectedPlayerId(null)}>← Back</button>

        <h1>{selectedPlayer.name}</h1>

        <p className="big-score">{selectedTotal}</p>

        <div className="history-rounds">
          {selectedPlayer.scores.map((score, index) => (
            <div key={index} className="history-round">
              <div className="round-history-row">
              <span className="round-label-pill">Round {index + 1}:</span>
              <span className="round-score-pill">{score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showWinnerScreen && winner) {

    const winnerTotal = winner.scores.reduce(
      (sum, score) => sum + score,
      0
    );

    const finalStandings = [...players].sort((a,  b) => {
      const totalA = a.scores.reduce((sum, score) => sum + score, 0);
      const totalB = b.scores.reduce((sum, score) => sum + score, 0);

      return totalB - totalA;
    });

    return (
      <div className="winner-screen">

        <h1>🏆Game Over</h1>

        <h2>{winner.name}</h2>

        <p className="winner-score">
          {winnerTotal}
        </p>

        <div className="final-standings">
          <h2>Final Standings</h2>

          {finalStandings.map((player, index) => {
            const total = player.scores.reduce(
              (sum, score) => sum + score,
              0
            );

            return (
              <div key={player.id} className="standing-row">
                <span>
                  {index === 0 ? "" : `#${index + 1}`}
                </span>

                <span>{player.name}</span>

                <span>{total}</span>
              </div>  
            );
          })}
        </div>

        <p className="rounds-played">
          Rounds Played: {roundNumber - 1}
        </p>

        <button onClick={resetGame}>New Game

        </button>

      </div>
    );
  }

  return (
    <div className="app">
      <h1>Game Night Scorekeeper</h1>
        
        <h2>Round {roundNumber}</h2>

        <p className="game-settings">
          Target: {winningScore} | Rule:{""}
          {winMode === "endOfRound" ? "End of Round" : "Instant Win"}
        </p>

        {winner && (
          <h2 className="winner-message">
            🏆Winner: {winner.name}
          </h2>
        )}

        {winner && (
          <p className="game-over-text">
            Game Over
          </p>
        )}

      {gamePhase === "setup" && (
      <div className="player-form">
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
        />

        <button onClick={addPlayer}>Add Player</button>

        <div className="winning-score-input">

          <label>Winning Score:</label>

          <input 
            type="number"
            value={winningScore}
            onChange={(e) => 
            setWinningScore(Number(e.target.value))
            }
          />
        </div>

        <div className="win-mode-input">
          <label>Win Rule:</label>

          <select 
          value={winMode}
          onChange={(e) => setWinMode(e.target.value)}
          >
            <option value="endOfRound">End of Round</option>

          </select>
        </div>
      


      </div>
      )}

      <div className="player-list">
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className={`player-card ${
            winner?.id === player.id ? "winner-card" : ""
          } ${currentLeader?.id === player.id && gamePhase === "playing"
            ? "leader-card" : ""
          }`}
          > 

            {gamePhase === "setup" ? (
            <>
            <h2>{index === 0 ? "👑" : `#${index + 1}`} - {player.name}</h2>

            <div className="player-actions">

            <button onClick={() => removePlayer(player.id)}>Remove Player</button>

            <button onClick={() => movePlayerUp(index)}>↑</button>

            <button onClick={() => movePlayerDown(index)}>↓</button>
            </div>
            </>
            ) : (
              <>
              <div className="compact-score-row">

                <div className="compact-player-info">
                  <strong>{currentLeader?.id === player.id ? "👑" : ""} 
                    {player.name}</strong>

                  <span>
                    Total:{""}
                    {player.scores.reduce((sum, score) => sum + score, 0)}
                  </span>
                </div>
              
          <div className="player-controls"> 
            <button className="view-button" onClick={() => setSelectedPlayerId(player.id)}
            >View</button>

            <input 
            className="score-input"
            type="number"
            placeholder="Score"
            value={roundScores[player.id] || ""}
            onChange={(e) =>
              updateRoundScore(player.id, e.target.value)
          }
          disabled={winner}
          />
          </div> 
        </div>
        </>
        )}

           {selectedPlayerId === player.id && (
            <div className="score-history">

              <h3>{player.name}</h3>

              <div className="history-total">
                Total: {player.scores.reduce((sum, score) => sum + score, 0)}
              </div>

              <div className="history-rounds">
                {player.scores.map((score, index) => (
                  <div
                    key={index}
                    className="history-round"
                  >
                    <span>Round {index + 1}</span>
                    <span>{score}</span>
                  </div>
                ))}
              </div>

              <button
                className="close-history"
                onClick={() => setSelectedPlayerId(null)}
              >
                Close
              </button>

            </div>
          )}
          </div>
        ))}
      </div>

      {gamePhase === "setup" && players.length > 0 && (
        <button onClick={() => setGamePhase("playing")}>Start Game</button>
      )}

      {gamePhase === "playing" && (
      <>
      <button 
      className="submit-button"
      onClick={submitRound} disabled={winner}>Submit Round {roundNumber}</button>
      </>
      )}

      <button className="secondary-button" onClick={resetGame}>Reset Game</button>

    </div>

  );
}

export default App;