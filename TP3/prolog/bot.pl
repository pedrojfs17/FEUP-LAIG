% Gets a random Piece to move
getRandomPiece(PieceAndMove,SelIndex,SelectedPiece,GoToMove):-
    length(PieceAndMove, AvailableMoves),
    random(0, AvailableMoves, SelIndex),
    nth0(SelIndex, PieceAndMove, GoToMove),
    \+ length(GoToMove,1),
    nth0(0,GoToMove,SelectedPiece).

% Gets a random cell to move to
getRandomPiece(PieceAndMove,SelIndex,SelectedPiece):-
    length(PieceAndMove, AvailableMoves),
    random(1, AvailableMoves, SelIndex),
    nth0(SelIndex, PieceAndMove, SelectedPiece).


% Get list of board evaluation
value(GameState,PieceAndMove,Player,Value):-
    findall(
        ValuePiece-Piece-NMove-Index-MovInd,
        (
            nth0(Index,PieceAndMove,GoToMove),
            nth0(0,GoToMove,Piece),
            nth0(MovInd,GoToMove,NMove),
            MovInd\=0,
            pieceValue(GameState,NMove,Player,ValuePiece)

        ),
        ValueLists
    ),
    sort(ValueLists,SortedValues),
    reverse(SortedValues, Value).

% Evaluation of the board (points per stack)
pieceValue(GameState, Piece, Player, ValuePiece):-
    Piece=[SelColumn,SelRow],
    getCellContent(SelColumn, SelRow, Content, GameState),
    countPoints(Content,ValuePiece).