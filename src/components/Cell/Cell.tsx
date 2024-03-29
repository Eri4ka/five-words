import { FC, useContext, useMemo, lazy, Suspense } from 'react';
import cl from 'classnames';

import { BoardContext, BoardContextType } from 'context/boardContext';
import { useTooltip } from 'hooks/useTooltip';
import { EMPTY__TOOLTIP, EXACT__TOOLTIP, EXIST__TOOLTIP, NOTFOUND__TOOLTIP } from 'utils/constants/tooltipSettings';
import { CELLS_IN_LINE, CHAR_FLIP_DELAY, LINE_SHAKE_DURATION } from 'utils/constants/boardSettings';

import styles from './Cell.module.scss';

const Tooltip = lazy(() => import('components/Tooltip'));

type CellProps = {
  cellPos: number;
  linePos: number;
  isNotFoundLine?: boolean;
  isWinningLine: boolean;
  value?: string;
};

const Cell: FC<CellProps> = ({ cellPos, linePos, isNotFoundLine, isWinningLine, value }) => {
  const { board, winningWord, currentLine } = useContext(BoardContext) as BoardContextType;

  const char = value ?? board[linePos][cellPos];

  const isPassedLine = !value && currentLine.linepos > linePos;
  const isActive = !value && !isPassedLine && !!char;
  const isExact = !value && isPassedLine && winningWord[cellPos].toUpperCase() === char.toUpperCase();

  const isExists =
    !value && isPassedLine && !isExact && winningWord.toUpperCase().indexOf(char.toUpperCase()) !== -1 && char !== '';
  const isEmpty = !value && isPassedLine && !isExact && !isExists;
  const isNotFoundCell = currentLine.linepos === linePos && cellPos === 0 && !!char;

  const { isVisibleTooltip, handleClick, containerRef } = useTooltip(
    isNotFoundCell,
    isNotFoundLine,
    CHAR_FLIP_DELAY * CELLS_IN_LINE,
    LINE_SHAKE_DURATION,
  );

  const computedClassNames = cl(
    styles.cell,
    isEmpty && styles.cell_empty,
    isActive && styles.cell_active,
    isExists && styles.cell_exists,
    isExact && styles.cell_exact,
    isWinningLine && styles.cell_win,
    value && styles.cell_logo,
  );

  const renderTooltip = useMemo(() => {
    const getTooltipPosition = () => {
      switch (cellPos) {
        case 0:
          return 'left';
        case 4:
          return 'right';
        default:
          return '';
      }
    };

    if (isPassedLine && isEmpty) {
      return <Tooltip text={EMPTY__TOOLTIP.text} emoji={EMPTY__TOOLTIP.emoji} position={getTooltipPosition()} />;
    }

    if (isPassedLine && isExact) {
      return <Tooltip text={EXACT__TOOLTIP.text} emoji={EXACT__TOOLTIP.emoji} position={getTooltipPosition()} />;
    }

    if (isPassedLine && isExists) {
      return <Tooltip text={EXIST__TOOLTIP.text} emoji={EXIST__TOOLTIP.emoji} position={getTooltipPosition()} />;
    }

    if (isNotFoundCell) {
      return <Tooltip text={NOTFOUND__TOOLTIP.text} emoji={NOTFOUND__TOOLTIP.emoji} position={getTooltipPosition()} />;
    }

    return null;
  }, [isEmpty, isExact, isExists, isNotFoundCell, isPassedLine, cellPos]);

  return (
    <div className={styles.root}>
      <Suspense>
        <div className={computedClassNames} onClick={handleClick} ref={containerRef}>
          {char}
        </div>
        {isVisibleTooltip && renderTooltip}
      </Suspense>
    </div>
  );
};

export default Cell;
