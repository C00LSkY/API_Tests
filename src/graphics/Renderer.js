/**
 * Класс Renderer - отрисовка всех элементов игры
 * Отвечает за рендеринг игрового поля, фигур и UI
 */

import { GAME_CONFIG } from '../utils/Config.js';

export class Renderer {
    /**
     * Создает новый рендерер
     * @param {HTMLCanvasElement} canvas - Canvas для основной игры
     * @param {HTMLCanvasElement} nextCanvas - Canvas для следующей фигуры
     */
    constructor(canvas, nextCanvas = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;
        
        // Настройка контекстов
        this.setupContext(this.ctx);
        if (this.nextCtx) {
            this.setupContext(this.nextCtx);
        }
    }

    /**
     * Настраивает контекст для четкой отрисовки
     * @param {CanvasRenderingContext2D} ctx - Контекст
     */
    setupContext(ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }

    /**
     * Основной метод отрисовки игры
     * @param {Object} gameState - Состояние игры
     */
    render(gameState) {
        this.clear();
        
        // Отрисовка фона и сетки
        this.drawBackground();
        this.drawGrid();
        
        // Отрисовка игрового поля
        this.drawBoard(gameState.board, gameState.lineClearAnimation);
        
        // Отрисовка тени фигуры
        if (gameState.ghostPiece) {
            this.drawGhostPiece(gameState.ghostPiece);
        }
        
        // Отрисовка текущей фигуры
        if (gameState.currentPiece) {
            this.drawPiece(gameState.currentPiece);
        }
        
        // Отрисовка следующей фигуры
        if (gameState.nextPiece && this.nextCtx) {
            this.drawNextPiece(gameState.nextPiece);
        }
    }

    /**
     * Очищает canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.nextCtx) {
            this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        }
    }

    /**
     * Отрисовывает фон игрового поля
     */
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Отрисовывает сетку игрового поля
     */
    drawGrid() {
        if (!GAME_CONFIG.GRAPHICS.SHOW_GRID) {
            return;
        }
        
        this.ctx.strokeStyle = GAME_CONFIG.TETROMINO_COLORS.GRID;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        
        const blockSize = GAME_CONFIG.BLOCK_SIZE;
        
        // Вертикальные линии
        for (let x = 0; x <= GAME_CONFIG.BOARD_WIDTH; x++) {
            const posX = x * blockSize + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(posX, 0);
            this.ctx.lineTo(posX, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Горизонтальные линии
        for (let y = 0; y <= GAME_CONFIG.BOARD_HEIGHT; y++) {
            const posY = y * blockSize + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, posY);
            this.ctx.lineTo(this.canvas.width, posY);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Отрисовывает игровое поле
     * @param {Array<Array<string>>} board - Игровое поле
     * @param {Object} lineClearAnimation - Анимация очистки линий
     */
    drawBoard(board, lineClearAnimation = null) {
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const color = board[row][col];
                
                if (color !== GAME_CONFIG.TETROMINO_COLORS.EMPTY) {
                    let alpha = 1;
                    
                    // Эффект мигания для очищаемых линий
                    if (lineClearAnimation && lineClearAnimation.lines.includes(row)) {
                        const elapsed = Date.now() - lineClearAnimation.startTime;
                        const progress = elapsed / lineClearAnimation.duration;
                        alpha = 0.3 + 0.7 * Math.abs(Math.sin(progress * Math.PI * 4));
                    }
                    
                    this.drawBlock(col, row, color, alpha);
                }
            }
        }
    }

    /**
     * Отрисовывает тетромино
     * @param {Object} piece - Фигура тетромино
     * @param {number} alpha - Прозрачность
     */
    drawPiece(piece, alpha = 1) {
        const shape = piece.getShape();
        const color = piece.getColor();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const x = piece.x + col;
                    const y = piece.y + row;
                    
                    // Отрисовываем только видимые блоки
                    if (y >= 0 && y < GAME_CONFIG.BOARD_HEIGHT && 
                        x >= 0 && x < GAME_CONFIG.BOARD_WIDTH) {
                        this.drawBlock(x, y, color, alpha);
                    }
                }
            }
        }
    }

    /**
     * Отрисовывает тень фигуры
     * @param {Object} ghostPiece - Тень фигуры
     */
    drawGhostPiece(ghostPiece) {
        if (!GAME_CONFIG.GRAPHICS.SHOW_GHOST) {
            return;
        }
        
        this.ctx.globalAlpha = 0.3;
        
        const shape = ghostPiece.getShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const x = ghostPiece.x + col;
                    const y = ghostPiece.y + row;
                    
                    if (y >= 0 && y < GAME_CONFIG.BOARD_HEIGHT && 
                        x >= 0 && x < GAME_CONFIG.BOARD_WIDTH) {
                        this.drawBlockOutline(x, y, GAME_CONFIG.TETROMINO_COLORS.GHOST);
                    }
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Отрисовывает следующую фигуру
     * @param {Object} nextPiece - Следующая фигура
     */
    drawNextPiece(nextPiece) {
        if (!this.nextCtx) {
            return;
        }
        
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // Фон для следующей фигуры
        this.nextCtx.fillStyle = '#0a0a0a';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const shape = nextPiece.getShape();
        const color = nextPiece.getColor();
        const blockSize = 20; // Меньший размер для preview
        
        // Центрируем фигуру
        const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const x = offsetX + col * blockSize;
                    const y = offsetY + row * blockSize;
                    
                    this.drawBlockAt(this.nextCtx, x, y, blockSize, color);
                }
            }
        }
    }

    /**
     * Отрисовывает один блок
     * @param {number} gridX - X координата в сетке
     * @param {number} gridY - Y координата в сетке
     * @param {string} color - Цвет блока
     * @param {number} alpha - Прозрачность
     */
    drawBlock(gridX, gridY, color, alpha = 1) {
        const x = gridX * GAME_CONFIG.BLOCK_SIZE;
        const y = gridY * GAME_CONFIG.BLOCK_SIZE;
        
        this.drawBlockAt(this.ctx, x, y, GAME_CONFIG.BLOCK_SIZE, color, alpha);
    }

    /**
     * Отрисовывает блок по пиксельным координатам
     * @param {CanvasRenderingContext2D} ctx - Контекст
     * @param {number} x - X координата в пикселях
     * @param {number} y - Y координата в пикселях
     * @param {number} size - Размер блока
     * @param {string} color - Цвет блока
     * @param {number} alpha - Прозрачность
     */
    drawBlockAt(ctx, x, y, size, color, alpha = 1) {
        const oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = alpha;
        
        // Основной блок
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        
        // Световые эффекты для объема
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);
        
        // Граница блока
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
        
        ctx.globalAlpha = oldAlpha;
    }

    /**
     * Отрисовывает контур блока
     * @param {number} gridX - X координата в сетке
     * @param {number} gridY - Y координата в сетке
     * @param {string} color - Цвет контура
     */
    drawBlockOutline(gridX, gridY, color) {
        const x = gridX * GAME_CONFIG.BLOCK_SIZE;
        const y = gridY * GAME_CONFIG.BLOCK_SIZE;
        const size = GAME_CONFIG.BLOCK_SIZE;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        this.ctx.setLineDash([]);
    }

    /**
     * Изменяет размер canvas
     * @param {number} width - Новая ширина
     * @param {number} height - Новая высота
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.setupContext(this.ctx);
    }

    /**
     * Получает позицию мыши относительно canvas
     * @param {MouseEvent} event - Событие мыши
     * @returns {Object} Координаты {x, y}
     */
    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    /**
     * Преобразует пиксельные координаты в координаты сетки
     * @param {number} pixelX - X в пикселях
     * @param {number} pixelY - Y в пикселях
     * @returns {Object} Координаты сетки {x, y}
     */
    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / GAME_CONFIG.BLOCK_SIZE),
            y: Math.floor(pixelY / GAME_CONFIG.BLOCK_SIZE)
        };
    }

    /**
     * Отрисовывает текст с обводкой
     * @param {string} text - Текст
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {string} fillColor - Цвет заливки
     * @param {string} strokeColor - Цвет обводки
     * @param {string} font - Шрифт
     */
    drawStrokedText(text, x, y, fillColor = '#ffffff', strokeColor = '#000000', font = '16px Arial') {
        this.ctx.font = font;
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.fillStyle = fillColor;
        
        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);
    }
}