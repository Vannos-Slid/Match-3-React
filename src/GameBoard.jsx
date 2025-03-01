import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"
import "./GameBoard.css";

const width = 8;

import reptile from "./images/Characters/reptile.gif"
import rain from "./images/Characters/rain.gif"
import scorpion from "./images/Characters/scorpion.gif"
import subzero from "./images/Characters/subzero.gif"
import ermac from "./images/Characters/ermac.gif"

const images = [reptile, rain, scorpion, subzero, ermac];

const getRandomTile = () => {
    return images[Math.floor(Math.random() * images.length)];
}

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
            image: getRandomTile(),
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
            let newBoard = [...prevBoard];
            [newBoard[index1], newBoard[index2]] =
                // [
                //     { ...newBoard[index2], x: index1 % width, y: Math.floor(index1 / width) },
                //     { ...newBoard[index1], x: index2 % width, y: Math.floor(index2 / width) }
                // ];
                [newBoard[index2], newBoard[index1]];
            return newBoard;
        });

        setTimeout(() => {
            setBoard(prevBoard => {
                let newBoard = [...prevBoard];
                if (!removeMatches(newBoard)) {
                    [newBoard[index1], newBoard[index2]] = [newBoard[index2], newBoard[index1]];
                }
                return newBoard;
            });
        }, 300);
    };

    const removeMatches = (currentBoard) => {
        let newBoard = [...currentBoard];
        let matches = new Array(width * width).fill(false);
        let found = false;

        // Перевірка горизонтальних збігів
        for (let i = 0; i < width * width; i++) {
            if (i % width < width - 2 &&
                newBoard[i].image === newBoard[i + 1].image &&
                newBoard[i].image === newBoard[i + 2].image) {
                matches[i] = matches[i + 1] = matches[i + 2] = true;
                found = true;
            }
        }

        // Перевірка вертикальних збігів
        for (let i = 0; i < width * (width - 2); i++) {
            if (newBoard[i].image === newBoard[i + width].image &&
                newBoard[i].image === newBoard[i + width * 2].image) {
                matches[i] = matches[i + width] = matches[i + width * 2] = true;
                found = true;
            }
        }

        if (!found) return false;

        // Заповнення пустих місць null
        for (let i = 0; i < newBoard.length; i++) {
            if (matches[i]) {
                newBoard[i] = { image: null, x: i % width, y: Math.floor(i / width) };
                // newBoard[i] = null;
            }
        }

        setBoard([...newBoard]);

        setTimeout(() => dropTiles(newBoard), 300);
        return true;
    };

    function Tile({ image, isSelected, onClick, x, y }) {

        return (
            <motion.img
                // layoutId={`tile-${x}-${y}`}
                layout
                key={`${x}-${y}`}
                src={image}
                alt="tile"
                onClick={onClick}
                className={`tile ${isSelected ? "selected" : ""}`}
                // initial={{ opacity: 0 }}
                // animate={{ opacity: 1, x: x * 50, y: y * 50 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    // mass: 1
                }}
                style={{
                    // position: "absolute",
                    width: "50px",
                    height: "50px",
                    borderRadius: "20px",
                    visibility: image ? "visible" : "hidden",
                }}
            >

            </motion.img>
        )
    }

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
                    newBoard[newIndex] = { ...newBoard[index], x: col, y: row + emptySpaces };
                    newBoard[index] = { image: null, x: col, y: row };
                }
            }
        }

        setBoard([...newBoard]);

        setTimeout(() => {
            // Додаємо нові плитки у верхні рядки
            for (let col = 0; col < width; col++) {
                for (let row = 0; row < width; row++) {
                    let index = row * width + col;
                    if (newBoard[index].image === null) {
                        newBoard[index] = {
                            image: getRandomTile(),
                            x: col,
                            y: row
                        };
                    }
                }
            }
            setBoard([...newBoard]);

            // Викликаємо `removeMatches` ще раз, щоб перевірити нові збіги
            setTimeout(() => removeMatches(newBoard), 500);
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

    return (
        <div className="game-board">
            {board.map((tile, index) => tile && (
                <Tile
                    key={index}
                    image={tile.image}
                    isSelected={selected === index}
                    x={tile.x}
                    y={tile.y}
                    onClick={() => handleTileClick(index)}
                ></Tile>
            ))}
        </div>
    );
};

export default GameBoard;
