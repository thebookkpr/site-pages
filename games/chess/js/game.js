(() => {
  const boardElement = document.getElementById("board");
  const statusElement = document.getElementById("status");
  const undoButton = document.getElementById("undo");
  const resetButton = document.getElementById("reset");

  const symbols = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟"
  };

  const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  let game = null;
  let selectedSquare = null;
  let legalTargets = [];
  let cpuThinking = false;

  function loadChessLibrary() {
    if (typeof Chess !== "undefined") {
      startGame();
      return;
    }

    statusElement.textContent = "Loading chess rules…";

    const sources = [
      "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js",
      "https://cdn.jsdelivr.net/npm/chess.js@0.10.3/chess.min.js"
    ];

    function trySource(index) {
      if (index >= sources.length) {
        statusElement.textContent =
          "Could not load chess rules. Check your internet connection and reload.";
        return;
      }

      const script = document.createElement("script");
      script.src = sources[index];
      script.onload = () => {
        if (typeof Chess === "undefined") {
          trySource(index + 1);
        } else {
          startGame();
        }
      };
      script.onerror = () => trySource(index + 1);
      document.head.appendChild(script);
    }

    trySource(0);
  }

  function startGame() {
    game = new Chess();
    selectedSquare = null;
    legalTargets = [];
    cpuThinking = false;
    render();
  }

  function render() {
    if (!game) return;

    boardElement.replaceChildren();
    const position = game.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const name = `${"abcdefgh"[col]}${8 - row}`;
        const piece = position[row][col];
        const square = document.createElement("button");

        square.type = "button";
        square.className = `square ${(row + col) % 2 ? "dark" : "light"}`;
        square.setAttribute("role", "gridcell");
        square.setAttribute("aria-label", piece
          ? `${piece.color === "w" ? "White" : "Black"} ${piece.type} on ${name}`
          : name);

        if (name === selectedSquare) square.classList.add("selected");
        if (legalTargets.includes(name)) square.classList.add("legal");

        if (piece) {
          const pieceElement = document.createElement("span");
          pieceElement.className =
            `piece ${piece.color === "w" ? "white" : "black"}`;
          pieceElement.textContent = symbols[piece.color + piece.type];
          square.appendChild(pieceElement);
        }

        square.addEventListener("click", () => handleSquareClick(name));
        boardElement.appendChild(square);
      }
    }

    updateStatus();
  }

  function handleSquareClick(name) {
    if (!game || cpuThinking || game.game_over() || game.turn() !== "w") return;

    const piece = game.get(name);

    if (selectedSquare && legalTargets.includes(name)) {
      game.move({ from: selectedSquare, to: name, promotion: "q" });
      selectedSquare = null;
      legalTargets = [];
      render();
      makeCpuMove();
      return;
    }

    if (piece && piece.color === "w") {
      selectedSquare = name;
      legalTargets = game.moves({ square: name, verbose: true })
        .map(move => move.to);
    } else {
      selectedSquare = null;
      legalTargets = [];
    }

    render();
  }

  function evaluateBoard() {
    let score = 0;
    for (const row of game.board()) {
      for (const piece of row) {
        if (piece) {
          const value = pieceValues[piece.type];
          score += piece.color === "w" ? value : -value;
        }
      }
    }
    return score;
  }

  function minimax(depth, alpha, beta) {
    if (depth === 0 || game.game_over()) return evaluateBoard();

    const moves = game.moves({ verbose: true });
    if (game.turn() === "w") {
      let best = -Infinity;
      for (const move of moves) {
        game.move(move);
        best = Math.max(best, minimax(depth - 1, alpha, beta));
        game.undo();
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of moves) {
        game.move(move);
        best = Math.min(best, minimax(depth - 1, alpha, beta));
        game.undo();
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  function makeCpuMove() {
    if (game.game_over()) {
      render();
      return;
    }

    cpuThinking = true;
    statusElement.textContent = "CPU is thinking…";

    setTimeout(() => {
      const moves = game.moves({ verbose: true });
      let bestScore = Infinity;
      let bestMoves = [];

      for (const move of moves) {
        game.move(move);
        const score = minimax(2, -Infinity, Infinity);
        game.undo();

        if (score < bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      }

      if (bestMoves.length) {
        const choice = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        game.move({
          from: choice.from,
          to: choice.to,
          promotion: "q"
        });
      }

      cpuThinking = false;
      render();
    }, 150);
  }

  function updateStatus() {
    if (game.game_over()) {
      if (game.in_checkmate()) {
        statusElement.textContent =
          game.turn() === "w" ? "Checkmate — CPU wins!" : "Checkmate — you win!";
      } else {
        statusElement.textContent = "Draw.";
      }
      return;
    }

    statusElement.textContent = game.in_check()
      ? (game.turn() === "w" ? "Your turn — check!" : "CPU to move — check!")
      : (game.turn() === "w" ? "Your turn (White)" : "CPU is thinking…");
  }

  undoButton.addEventListener("click", () => {
    if (!game || cpuThinking) return;

    game.undo(); // Undo CPU move
    if (game.turn() === "b") game.undo(); // Also undo your move

    selectedSquare = null;
    legalTargets = [];
    render();
  });

  resetButton.addEventListener("click", () => {
    if (game) startGame();
  });

  loadChessLibrary();
})();
