(() => {
  const boardElement = document.getElementById("board");
  const statusElement = document.getElementById("status");
  const undoButton = document.getElementById("undo");
  const resetButton = document.getElementById("reset");

  const symbols = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟"
  };

  let game;
  let selectedSquare = null;
  let legalTargets = [];

  function startGame() {
    if (typeof Chess === "undefined") {
      statusElement.textContent = "Could not load chess rules. Check your internet connection.";
      return;
    }

    game = new Chess();
    selectedSquare = null;
    legalTargets = [];
    render();
  }

  function render() {
    if (!game) return;

    boardElement.replaceChildren();
    const position = game.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const squareName = `${"abcdefgh"[col]}${8 - row}`;
        const piece = position[row][col];
        const square = document.createElement("button");

        square.type = "button";
        square.className = `square ${(row + col) % 2 ? "dark" : "light"}`;
        square.setAttribute("role", "gridcell");
        square.setAttribute("aria-label", squareLabel(squareName, piece));

        if (squareName === selectedSquare) square.classList.add("selected");
        if (legalTargets.includes(squareName)) square.classList.add("legal");

        if (piece) {
          const pieceElement = document.createElement("span");
          pieceElement.className = `piece ${piece.color === "w" ? "white" : "black"}`;
          pieceElement.textContent = symbols[piece.color + piece.type];
          square.appendChild(pieceElement);
        }

        square.addEventListener("click", () => handleSquareClick(squareName));
        boardElement.appendChild(square);
      }
    }

    updateStatus();
  }

  function squareLabel(squareName, piece) {
    if (!piece) return squareName;
    const color = piece.color === "w" ? "White" : "Black";
    const names = {
      k: "king", q: "queen", r: "rook",
      b: "bishop", n: "knight", p: "pawn"
    };
    return `${color} ${names[piece.type]} on ${squareName}`;
  }

  function handleSquareClick(squareName) {
    const piece = game.get(squareName);

    if (selectedSquare && legalTargets.includes(squareName)) {
      try {
        game.move({ from: selectedSquare, to: squareName, promotion: "q" });
      } catch {
        // Invalid moves are ignored; the board remains playable.
      }
      selectedSquare = null;
      legalTargets = [];
      render();
      return;
    }

    if (piece && piece.color === game.turn()) {
      selectedSquare = squareName;
      legalTargets = game.moves({ square: squareName, verbose: true })
        .map(move => move.to);
    } else {
      selectedSquare = null;
      legalTargets = [];
    }

    render();
  }

  function updateStatus() {
    const side = game.turn() === "w" ? "White" : "Black";

    if (game.isCheckmate()) {
      statusElement.textContent = `Checkmate — ${side === "White" ? "Black" : "White"} wins!`;
    } else if (game.isDraw()) {
      statusElement.textContent = "Draw.";
    } else if (game.isCheck()) {
      statusElement.textContent = `${side} to move — check!`;
    } else {
      statusElement.textContent = `${side} to move`;
    }
  }

  undoButton.addEventListener("click", () => {
    if (game) {
      game.undo();
      selectedSquare = null;
      legalTargets = [];
      render();
    }
  });

  resetButton.addEventListener("click", startGame);

  startGame();
})();
