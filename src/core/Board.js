/**
 * Класс Board - управление игровым полем Тетрис
 * Отвечает за состояние поля, размещение фигур и очистку линий
 */

import { GAME_CONFIG } from '../utils/Config.js';

export class Board {
    /**
     * Создает новое игровое поле
     */
    constructor() {
        this.width = GAME_CONFIG.BOARD_WIDTH;
        this.height = GAME_CONFIG.BOARD_HEIGHT;
        this.grid = this.createEmptyGrid();
        this.linesCleared = 0;
        this.pendingLineClearAnimation = null;
    }

    /**
     * Создает пустую сетку игрового поля
     * @returns {Array<Array<string>>} Двумерный массив с цветами блоков
     */
    createEmptyGrid() {
        return Array(this.height).fill(null).map(() => 
            Array(this.width).fill(GAME_CONFIG.TETROMINO_COLORS.EMPTY)
        );
    }

    /**
     * Проверяет, валидна ли позиция для размещения фигуры
     * @param {Object} piece - Объект тетромино
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @returns {boolean} true если позиция валидна
     */
    isValidPosition(piece, x, y) {
        const shape = piece.getShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Проверка границ поля
                    if (newX < 0 || newX >= this.width || newY >= this.height) {
                        return false;
                    }
                    
                    // Проверка коллизии с существующими блоками (но не с верхом поля)
                    if (newY >= 0 && this.grid[newY][newX] !== GAME_CONFIG.TETROMINO_COLORS.EMPTY) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    /**
     * Размещает фигуру на игровом поле
     * @param {Object} piece - Объект тетромино
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @returns {boolean} true если фигура была размещена успешно
     */
    placePiece(piece, x, y) {
        const shape = piece.getShape();
        const color = piece.getColor();
        
        // Проверяем валидность позиции перед размещением
        if (!this.isValidPosition(piece, x, y)) {
            return false;
        }
        
        // Размещаем блоки фигуры на поле
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Размещаем только если блок находится в пределах видимого поля
                    if (newY >= 0 && newY < this.height && newX >= 0 && newX < this.width) {
                        this.grid[newY][newX] = color;
                    }
                }
            }
        }
        
        return true;
    }

    /**
     * Проверяет и очищает заполненные линии
     * @returns {number} Количество очищенных линий
     */
    clearLines() {
        const linesToClear = [];
        
        // Находим все заполненные линии
        for (let row = 0; row < this.height; row++) {
            if (this.isLineFull(row)) {
                linesToClear.push(row);
            }
        }
        
        if (linesToClear.length === 0) {
            return 0;
        }
        
        // Запускаем анимацию очистки линий
        this.pendingLineClearAnimation = {
            lines: linesToClear,
            startTime: Date.now(),
            duration: GAME_CONFIG.GRAPHICS.LINE_CLEAR_ANIMATION_DURATION
        };
        
        // Возвращаем количество очищенных линий для подсчета очков
        return linesToClear.length;
    }

    /**
     * Завершает анимацию очистки линий и удаляет их
     */
    finishLineClearAnimation() {
        if (!this.pendingLineClearAnimation) {
            return;
        }
        
        const { lines } = this.pendingLineClearAnimation;
        
        // Удаляем линии сверху вниз для корректного сдвига
        for (let i = lines.length - 1; i >= 0; i--) {
            this.removeLine(lines[i]);
        }
        
        this.linesCleared += lines.length;
        this.pendingLineClearAnimation = null;
    }

    /**
     * Проверяет, заполнена ли линия
     * @param {number} row - Номер строки
     * @returns {boolean} true если линия заполнена
     */
    isLineFull(row) {
        return this.grid[row].every(cell => cell !== GAME_CONFIG.TETROMINO_COLORS.EMPTY);
    }

    /**
     * Удаляет линию и сдвигает верхние линии вниз
     * @param {number} row - Номер строки для удаления
     */
    removeLine(row) {
        // Удаляем указанную строку
        this.grid.splice(row, 1);
        
        // Добавляем новую пустую строку сверху
        this.grid.unshift(Array(this.width).fill(GAME_CONFIG.TETROMINO_COLORS.EMPTY));
    }

    /**
     * Проверяет условие окончания игры
     * @returns {boolean} true если игра должна закончиться
     */
    isGameOver() {
        // Игра заканчивается, если верхняя невидимая строка содержит блоки
        return this.grid[0].some(cell => cell !== GAME_CONFIG.TETROMINO_COLORS.EMPTY);
    }

    /**
     * Находит позицию "тени" (ghost) для текущей фигуры
     * @param {Object} piece - Объект тетромино
     * @param {number} x - X координата фигуры
     * @param {number} startY - Начальная Y координата
     * @returns {number} Y координата для тени фигуры
     */
    getGhostPosition(piece, x, startY) {
        let ghostY = startY;
        
        // Опускаем фигуру до первого препятствия
        while (this.isValidPosition(piece, x, ghostY + 1)) {
            ghostY++;
        }
        
        return ghostY;
    }

    /**
     * Получает текущее состояние игрового поля
     * @returns {Array<Array<string>>} Копия игровой сетки
     */
    getBoard() {
        return this.grid.map(row => [...row]);
    }

    /**
     * Получает блок по координатам
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @returns {string} Цвет блока
     */
    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return GAME_CONFIG.TETROMINO_COLORS.EMPTY;
        }
        return this.grid[y][x];
    }

    /**
     * Устанавливает блок по координатам (для отладки)
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {string} color - Цвет блока
     */
    setCell(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = color;
        }
    }

    /**
     * Сбрасывает игровое поле для новой игры
     */
    reset() {
        this.grid = this.createEmptyGrid();
        this.linesCleared = 0;
        this.pendingLineClearAnimation = null;
    }

    /**
     * Получает информацию о текущей анимации очистки линий
     * @returns {Object|null} Информация об анимации или null
     */
    getLineClearAnimation() {
        return this.pendingLineClearAnimation;
    }

    /**
     * Проверяет, идет ли анимация очистки линий
     * @returns {boolean} true если анимация активна
     */
    isAnimatingLineClear() {
        if (!this.pendingLineClearAnimation) {
            return false;
        }
        
        const elapsed = Date.now() - this.pendingLineClearAnimation.startTime;
        return elapsed < this.pendingLineClearAnimation.duration;
    }

    /**
     * Обновляет состояние анимаций
     */
    update() {
        // Проверяем завершение анимации очистки линий
        if (this.pendingLineClearAnimation && !this.isAnimatingLineClear()) {
            this.finishLineClearAnimation();
        }
    }

    /**
     * Получает статистику игрового поля для отладки
     * @returns {Object} Статистика поля
     */
    getStats() {
        let filledCells = 0;
        let emptyLines = 0;
        
        for (let row = 0; row < this.height; row++) {
            let lineEmpty = true;
            for (let col = 0; col < this.width; col++) {
                if (this.grid[row][col] !== GAME_CONFIG.TETROMINO_COLORS.EMPTY) {
                    filledCells++;
                    lineEmpty = false;
                }
            }
            if (lineEmpty) {
                emptyLines++;
            }
        }
        
        return {
            filledCells,
            emptyLines,
            totalCells: this.width * this.height,
            fillPercentage: (filledCells / (this.width * this.height)) * 100
        };
    }
}