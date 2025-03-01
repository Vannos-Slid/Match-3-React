import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./GameBoard.css";

const width = 8;

import reptile from "./images/Characters/reptile.gif";
import rain from "./images/Characters/rain.gif";
import scorpion from "./images/Characters/scorpion.gif";
import subzero from "./images/Characters/subzero.gif";
import ermac from "./images/Characters/ermac.gif";

const images = [reptile, rain, scorpion, subzero, ermac];

const getRandomTile = () => ({
    id: Math.random(), // Унікальний ID для кожного нового елемента
    image: images[Math.floor(Math.random() * images.length)]
});

const hasMatches = (board) => {
    for (let i = 0; i < width * width; i++) {
        if (i % width < width - 2 &&
            board[i].image === board[i + 1].image &&
            board[i].image === board[i + 2].image) {
            return true;
        }
        if (i < width * (width - 2) &&
            board[i].image === board[i + width].image &&
            board[i].image === board[i + width * 2].image) {
            return true;
        }
    }
    return false;
};

const generateBoard = () => {
    let board;
    do {
        board = Array.from({ length: width * width }, (_, index) => ({
            ...getRandomTile(),
            x: index % width,
            y: Math.floor(index / width)
        }));
    } while (hasMatches(board));
    return board;
};

function GameBoard() {
    const [board, setBoard] = useState(generateBoard());
    const [selected, setSelected] = useState(null);

    const swapTiles = (index1, index2) => {
        setBoard(prevBoard => {
            let newBoard = prevBoard.map(tile => ({ ...tile })); // Глибока копія
            [newBoard[index1], newBoard[index2]] = [newBoard[index2], newBoard[index1]];
            [newBoard[index1].x, newBoard[index2].x] = [newBoard[index2].x, newBoard[index1].x];
            [newBoard[index1].y, newBoard[index2].y] = [newBoard[index2].y, newBoard[index1].y];
            return newBoard;
        });

        setTimeout(() => {
            setBoard(prevBoard => {
                let newBoard = prevBoard.map(tile => ({ ...tile }));
                if (!removeMatches(newBoard)) {
                    // Якщо матчів немає — повертаємо назад
                    [newBoard[index1], newBoard[index2]] = [newBoard[index2], newBoard[index1]];
                    [newBoard[index1].x, newBoard[index2].x] = [newBoard[index2].x, newBoard[index1].x];
                    [newBoard[index1].y, newBoard[index2].y] = [newBoard[index2].y, newBoard[index1].y];
                }
                return newBoard;
            });

            setSelected(null);
        }, 300);
    };



    const removeMatches = (currentBoard) => {
        let newBoard = [...currentBoard];
        let matches = new Array(width * width).fill(false);
        let found = false;

        // Пошук горизонтальних збігів
        for (let i = 0; i < width * width; i++) {
            if (i % width < width - 2 &&
                newBoard[i].image === newBoard[i + 1].image &&
                newBoard[i].image === newBoard[i + 2].image) {
                matches[i] = matches[i + 1] = matches[i + 2] = true;
                found = true;
            }
        }

        // Пошук вертикальних збігів
        for (let i = 0; i < width * (width - 2); i++) {
            if (newBoard[i].image === newBoard[i + width].image &&
                newBoard[i].image === newBoard[i + width * 2].image) {
                matches[i] = matches[i + width] = matches[i + width * 2] = true;
                found = true;
            }
        }

        if (!found) return false;

        // Встановлення прапора анімації зникання
        for (let i = 0; i < newBoard.length; i++) {
            if (matches[i]) {
                newBoard[i] = { ...newBoard[i], isFading: true };
            }
        }

        setBoard([...newBoard]);

        // Через 300 мс повністю видаляємо плитки
        setTimeout(() => {
            for (let i = 0; i < newBoard.length; i++) {
                if (matches[i]) {
                    newBoard[i] = { id: Math.random(), image: null, x: i % width, y: Math.floor(i / width) };
                }
            }

            setBoard([...newBoard]);
            setTimeout(() => dropTiles(newBoard), 300);
        }, 300);

        return true;
    };

    const dropTiles = (currentBoard) => {
        let newBoard = [...currentBoard];

        for (let col = 0; col < width; col++) {
            let emptySpaces = 0;

            for (let row = width - 1; row >= 0; row--) {
                let index = row * width + col;

                if (newBoard[index].image === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    let newIndex = index + emptySpaces * width;
                    newBoard[newIndex] = { ...newBoard[index], y: row + emptySpaces };
                    newBoard[index] = { id: Math.random(), image: null, x: col, y: row };
                }
            }
        }

        setBoard([...newBoard]);

        setTimeout(() => {
            for (let col = 0; col < width; col++) {
                for (let row = 0; row < width; row++) {
                    let index = row * width + col;
                    if (newBoard[index].image === null) {
                        newBoard[index] = { ...getRandomTile(), x: col, y: row };
                        // newBoard[index] = { ...getRandomTile(), x: col, y: row - width };
                    }
                }
            }
            setBoard([...newBoard]);
            setTimeout(() => removeMatches(newBoard), 300);
        }, 300);
    };

    const handleTileClick = (index) => {
        if (selected === null) {
            setSelected(index);
        } else {
            if ([index - 1, index + 1, index - width, index + width].includes(selected)) {
                swapTiles(selected, index);
            }
            setSelected(null);
        }
    };

    function Tile({ id, image, isSelected, isFading, onClick, x, y }) {
        if (image === null) {
            return (<motion.image style={{
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                position: "absolute",
                visibility: image ? "visible" : "hidden",
            }}></motion.image>)
        }
        return (
            <motion.img
                layoutId={id}
                layout
                key={id}
                src={image}
                alt="tile"
                onClick={onClick}
                className={`tile ${isSelected ? "selected" : ""}`}
                initial={false}
                animate={{
                    x: x * 50,
                    y: y * 50,
                    opacity: isFading ? 0 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    opacity: { duration: 0.3 },
                    y: { type: "spring", stiffness: 150, damping: 10 } // Плавне падіння
                }}
                style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "25px",
                    position: "absolute",
                    visibility: image ? "visible" : "hidden",
                }}
            />
        );
    }

    return (
        <div className="game-board">
            {board.map((tile, index) => (
                <Tile
                    key={`${tile.id}-${tile.x}-${tile.y}`}
                    // key={tile.id}
                    id={tile.id}
                    image={tile.image}
                    isSelected={selected === index}
                    x={tile.x}
                    y={tile.y}
                    onClick={() => handleTileClick(index)}
                />
            ))}
        </div>
    );
}

export default GameBoard;
