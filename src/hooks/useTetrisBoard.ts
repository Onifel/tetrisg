import { useReducer, Dispatch, useCallback, useEffect} from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';
import toast from 'react-hot-toast';


export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

type BoardState = {
  board: BoardShape;
  droppingRow: number;
  droppingColumn: number;
  droppingBlock: Block;
  droppingShape: BlockShape;
};

export function useTetrisBoard(): [BoardState, Dispatch<Action>] {
  const [boardState, dispatchBoardState] = useReducer(
    boardReducer,
    {
      board: getEmptyBoard(),
      droppingRow: 0,
      droppingColumn: 0,
      droppingBlock: Block.I,
      droppingShape: SHAPES.I.shape,
      gameOver: false,
    },
    (emptyState) => {
      const state = {
        ...emptyState,
        board: getEmptyBoard(),
      };
      return state;
    }
  );

  

  const isGameOver = boardState.board[0].some(cell => cell !== EmptyCell.Empty);

  const handleGameOver = useCallback(() => {
    if (isGameOver) {
      toast('Game Over');
    }
  }, [isGameOver]);

  useEffect(() => {
    handleGameOver();
  }, [boardState.board, handleGameOver]);

  return [boardState, dispatchBoardState];
}

export function getEmptyBoard(height = BOARD_HEIGHT): BoardShape {
  return Array(height)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

export function hasCollisions(
  board: BoardShape,
  currentShape: BlockShape,
  row: number,
  column: number
): boolean {
  let hasCollision = false;
  currentShape
    .filter((shapeRow) => shapeRow.some((isSet) => isSet))
    .forEach((shapeRow: boolean[], rowIndex: number) => {
      shapeRow.forEach((isSet: boolean, colIndex: number) => {
        if (
          isSet &&
          (row + rowIndex >= board.length ||
            column + colIndex >= board[0].length ||
            column + colIndex < 0 ||
            board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)
        ) {
          hasCollision = true;
        }
      });
    });
  return hasCollision;
}

export function getRandomBlock(): Block {
  const blockValues = Object.values(Block);
  return blockValues[Math.floor(Math.random() * blockValues.length)] as Block;
}

function rotateBlock(shape: BlockShape): BlockShape {
  const rows = shape.length;
  const columns = shape[0].length;

  const rotated = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(false));

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      rotated[column][rows - 1 - row] = shape[row][column];
    }
  }

  return rotated;
}

type Action = {
  type: 'start' | 'drop' | 'commit' | 'move' | 'reset';
  newBoard?: BoardShape;
  newBlock?: Block;
  isPressingLeft?: boolean;
  isPressingRight?: boolean;
  isRotating?: boolean;
};

function boardReducer(state: BoardState, action: Action): BoardState {
  let newState = { ...state };

  switch (action.type) {
    case 'start':
      const firstBlock = getRandomBlock();
      return {
        board: getEmptyBoard(),
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: firstBlock,
        droppingShape: SHAPES[firstBlock].shape,
      };
    case 'drop':
      newState.droppingRow++;
      break;
    case 'commit':
      if (!action.newBoard || !action.newBlock) {
        throw new Error('Missing newBoard or newBlock in commit action');
      }
      return {
        board: [
          ...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length),
          ...action.newBoard!,
        ],
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: action.newBlock!,
        droppingShape: SHAPES[action.newBlock!].shape,
      };
    case 'move':
      const rotatedShape = action.isRotating
        ? rotateBlock(newState.droppingShape)
        : newState.droppingShape;
      let columnOffset = action.isPressingLeft ? -1 : 0;
      columnOffset = action.isPressingRight ? 1 : columnOffset;
      if (
        !hasCollisions(
          newState.board,
          rotatedShape,
          newState.droppingRow,
          newState.droppingColumn + columnOffset
        )
      ) {
        newState.droppingColumn += columnOffset;
        newState.droppingShape = rotatedShape;
      }
      break;
    case 'reset':
      return {
        board: getEmptyBoard(),
        droppingRow: 0,
        droppingColumn: 0,
        droppingBlock: Block.I,
        droppingShape: SHAPES.I.shape,
      };  
    default:
      const unhandledType: never = action.type as never;
      throw new Error(`Unhandled action type: ${unhandledType}`);
  }

  // if (newState.board[0].some(cell => cell !== EmptyCell.Empty)) {
  //   toast("Game Over");
  //   return {
  //     board: getEmptyBoard(),
  //     droppingRow: 0,
  //     droppingColumn: 0,
  //     droppingBlock: Block.I,
  //     droppingShape: SHAPES.I.shape,
  //   };
  // }

  return newState;
}
