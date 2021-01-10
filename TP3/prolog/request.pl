

valid_moves(GameState, Player,ListOfMoves,TransBoard) :-
    transfromBoard(GameState,[],TransBoard,1),
    nth0(0, TransBoard, Row),
    length(Row, NumCols),
    length(TransBoard,NumRows),
    iterateMatrix(TransBoard, NumRows, NumCols, Player,ListOfMoves).

checkAvailableMoves(GameState,Player,[Done,PlayerMoves]):-
    valid_moves(GameState, 'blacks',BlackMoves,_),
    valid_moves(GameState, 'whites',WhiteMoves,_),
    exclude(empty, BlackMoves, ResultBlacks),
    exclude(empty, WhiteMoves, ResultWhites),
    (
        ( \+ length(ResultBlacks, 0), Done=0)
        ;
        ( \+ length(ResultWhites, 0), Done=0)
        ;
        (Done=1)
        
    ),
    (
        Player = 'blacks',
        PlayerMoves = BlackMoves
        ;
        Player = 'whites',
        PlayerMoves = WhiteMoves
    ).

game_over(GameState,Winner) :-
    write('Game Over!\n'),
    transfromBoard(GameState,[],TransBoard,1),
    checkWinner(TransBoard,Winner).

selectPiece(GameState,PieceAndMove,SelColumn,SelRow,ChosenPiece) :-
    length(PieceAndMove, LengthMove),
    validateContent(SelColumn, SelRow, GameState, FinalMoveGameState,PieceAndMove,0,LengthMove,ChosenPiece).

movePiece(GameState,FinalMoveGameState,PieceAndMove,ChosenPiece,MoveColumn,MoveRow) :-
    nth0(ChosenPiece,PieceAndMove,PieceMove),
    length(PieceMove, LengthMove),
    validateCapture(MoveRow, MoveColumn, GameState, FGS,PieceMove,1,LengthMove,ChosenPiece),
    write(FGS),
    (
        transfromBoard(FGS,[],FinalMoveGameState,0)
        ;
        FinalMoveGameState = []
    ).

choose_move(GameState,PieceAndMove,Player,1,Move):-
    getRandomPiece(PieceAndMove,_,SelectedPiece,GoToMove),
    getRandomPiece(GoToMove,_,MovingTo),
    SelectedPiece=[SelCol,SelRow],
    MovingTo=[MoveCol,MoveRow],
    Move=[SelCol,SelRow,MoveCol,MoveRow].

choose_move(GameState,PieceAndMove,Player,2,Move):-
    value(GameState,PieceAndMove,Player,ValuesList),   
    nth0(0,ValuesList,BestMove),
    BestMove=_-[SelCol,SelRow]-[MoveCol,MoveRow]-_-_,
    Move=[SelCol,SelRow,MoveCol,MoveRow].

initialBoard(GameBoard,1):-
    generate36Board(GB),
    transfromBoard(GB,[],GameBoard,0).
initialBoard(GameBoard,2):-
    generate54Board(GB),
    transfromBoard(GB,[],GameBoard,0).
initialBoard(GameBoard,3):-
    generate81Board(GB),
    transfromBoard(GB,[],GameBoard,0).


replace(empty,-1).
replace(black,0).
replace(white,1).
replace(green,2).

transformRow([],TRow,TRow,_).
transformRow([Cell|R],Acc,TRow,0):-
    findall(E,(member(X, Cell),replace(X,E)),TransCell),
    append(Acc,[TransCell],NAcc),
    transformRow(R,NAcc,TRow,0).

transformRow([Cell|R],Acc,TRow,1):-
    findall(E,(member(X, Cell),replace(E,X)),TransCell),
    append(Acc,[TransCell],NAcc),
    transformRow(R,NAcc,TRow,1).
    
transfromBoard([],TransBoard,TransBoard,_).
transfromBoard([R|Rest],Acc,TransBoard,Type):-
    findall(TransRow,transformRow(R,[],TransRow,Type),TR),
    append(Acc,TR,NAcc),
    transfromBoard(Rest,NAcc,TransBoard,Type).


count_points(GameState, [BlackPoints, WhitePoints]) :-
    transfromBoard(GameState,[],TransBoard,1),
    countPlayersPoints(TransBoard,WhitePoints,_,'whites'),
    countPlayersPoints(TransBoard,BlackPoints,_,'blacks').