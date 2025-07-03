/**
 * Класс Game - основной контроллер игры Тетрис
 * Управляет игровым циклом, состояниями и логикой игры
 */

import { GAME_CONFIG } from '../utils/Config.js';
import { Board } from './Board.js';
import { Tetromino, TetrominoBag } from './Tetromino.js';
import { ScoreManager } from './ScoreManager.js';

export class Game {
    /**
     * Создает новую игру
     * @param {HTMLCanvasElement} canvas - Canvas элемент для отрисовки
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Игровые компоненты
        this.board = new Board();
        this.scoreManager = new ScoreManager();
        this.tetrominoBag = new TetrominoBag();
        
        // Игровое состояние
        this.state = 'stopped'; // 'playing', 'paused', 'gameover', 'stopped'
        this.currentPiece = null;
        this.nextPiece = null;
        this.ghostPiece = null;
        
        // Временные переменные
        this.lastTime = 0;
        this.dropTimer = 0;
        this.lockTimer = 0;
        this.lockDelay = 500; // мс до фиксации фигуры
        this.animationId = null;
        
        // Настройки
        this.showGhost = true;
        this.fastDrop = false;
        
        // События
        this.eventListeners = new Map();
        
        // Инициализация
        this.setupCanvas();
        this.spawnNextPiece();
    }

    /**
     * Настраивает Canvas для игры
     */
    setupCanvas() {
        const width = GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.BLOCK_SIZE;
        const height = GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.BLOCK_SIZE;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Настройка контекста для четкой отрисовки
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Запускает игру
     */
    start() {
        if (this.state === 'playing') {
            return;
        }
        
        this.state = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
        this.emit('gameStart');
    }

    /**
     * Ставит игру на паузу
     */
    pause() {
        if (this.state !== 'playing') {
            return;
        }
        
        this.state = 'paused';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.emit('gamePause');
    }

    /**
     * Возобновляет игру после паузы
     */
    resume() {
        if (this.state !== 'paused') {
            return;
        }
        
        this.state = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
        this.emit('gameResume');
    }

    /**
     * Переключает паузу
     */
    togglePause() {
        if (this.state === 'playing') {
            this.pause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }

    /**
     * Перезапускает игру
     */
    restart() {
        // Сброс состояния
        this.state = 'stopped';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Сброс компонентов
        this.board.reset();
        this.scoreManager.reset();
        this.tetrominoBag = new TetrominoBag();
        
        // Сброс игровых переменных
        this.currentPiece = null;
        this.nextPiece = null;
        this.ghostPiece = null;
        this.dropTimer = 0;
        this.lockTimer = 0;
        this.fastDrop = false;
        
        // Создание новых фигур
        this.spawnNextPiece();
        
        this.emit('gameRestart');
    }

    /**
     * Завершает игру
     */
    gameOver() {
        this.state = 'gameover';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Сохраняем рекорд
        this.scoreManager.saveHighScore();
        
        this.emit('gameOver', {
            score: this.scoreManager.getScore(),
            level: this.scoreManager.getLevel(),
            lines: this.scoreManager.getLines(),
            isNewRecord: this.scoreManager.isNewRecord()
        });
    }

    /**
     * Основной игровой цикл
     * @param {number} currentTime - Текущее время
     */
    gameLoop(currentTime = performance.now()) {
        if (this.state !== 'playing') {
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Обновление игрового состояния
        this.update(deltaTime);
        
        // Планирование следующего кадра
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Обновляет состояние игры
     * @param {number} deltaTime - Время с последнего обновления в мс
     */
    update(deltaTime) {
        // Обновление доски (анимации очистки линий)
        this.board.update();
        
        // Если идет анимация очистки линий, не обновляем падение
        if (this.board.isAnimatingLineClear()) {
            return;
        }
        
        // Обновление падения фигуры
        this.updateDrop(deltaTime);
        
        // Обновление тени фигуры
        this.updateGhost();
        
        // Проверка окончания игры
        if (this.board.isGameOver()) {
            this.gameOver();
        }
    }

    /**
     * Обновляет падение текущей фигуры
     * @param {number} deltaTime - Время с последнего обновления
     */
    updateDrop(deltaTime) {
        if (!this.currentPiece) {
            return;
        }
        
        const dropSpeed = this.fastDrop ? 
            GAME_CONFIG.SOFT_DROP_SPEED : 
            this.scoreManager.getDropSpeed();
        
        this.dropTimer += deltaTime;
        
        // Время для падения
        if (this.dropTimer >= dropSpeed) {
            this.dropTimer = 0;
            
            if (this.currentPiece.moveDown(this.board)) {
                this.lockTimer = 0; // Сброс таймера фиксации при успешном движении
                
                // Очки за мягкое падение
                if (this.fastDrop) {
                    this.scoreManager.addScore('softDrop', 1);
                    this.emit('scoreUpdate');
                }
            } else {
                // Фигура не может двигаться вниз, начинаем отсчет фиксации
                this.lockTimer += dropSpeed;
                
                if (this.lockTimer >= this.lockDelay) {
                    this.lockPiece();
                }
            }
        }
    }

    /**
     * Обновляет позицию тени фигуры
     */
    updateGhost() {
        if (!this.currentPiece || !this.showGhost) {
            this.ghostPiece = null;
            return;
        }
        
        this.ghostPiece = this.currentPiece.clone();
        const ghostY = this.board.getGhostPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        this.ghostPiece.y = ghostY;
    }

    /**
     * Фиксирует текущую фигуру на поле
     */
    lockPiece() {
        if (!this.currentPiece) {
            return;
        }
        
        // Размещаем фигуру на поле
        this.board.placePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        
        // Проверяем и очищаем линии
        const linesCleared = this.board.clearLines();
        if (linesCleared > 0) {
            this.scoreManager.addScore('clearLines', linesCleared);
            this.emit('linesCleared', linesCleared);
        }
        
        // Создаем новую фигуру
        this.spawnNextPiece();
        
        this.emit('pieceLocked');
        this.emit('scoreUpdate');
    }

    /**
     * Создает новую фигуру
     */
    spawnNextPiece() {
        // Если нет следующей фигуры, создаем две
        if (!this.nextPiece) {
            this.nextPiece = this.tetrominoBag.getNext();
        }
        
        // Текущая фигура становится следующей
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.tetrominoBag.getNext();
        
        // Сбрасываем таймеры
        this.dropTimer = 0;
        this.lockTimer = 0;
        
        this.emit('pieceSpawned', this.currentPiece.getType());
    }

    /**
     * Перемещает текущую фигуру влево
     */
    moveLeft() {
        if (this.state !== 'playing' || !this.currentPiece || this.board.isAnimatingLineClear()) {
            return;
        }
        
        if (this.currentPiece.moveLeft(this.board)) {
            this.lockTimer = 0; // Сброс таймера фиксации
            this.emit('pieceMove', 'left');
        }
    }

    /**
     * Перемещает текущую фигуру вправо
     */
    moveRight() {
        if (this.state !== 'playing' || !this.currentPiece || this.board.isAnimatingLineClear()) {
            return;
        }
        
        if (this.currentPiece.moveRight(this.board)) {
            this.lockTimer = 0; // Сброс таймера фиксации
            this.emit('pieceMove', 'right');
        }
    }

    /**
     * Поворачивает текущую фигуру по часовой стрелке
     */
    rotateCW() {
        if (this.state !== 'playing' || !this.currentPiece || this.board.isAnimatingLineClear()) {
            return;
        }
        
        if (this.currentPiece.rotateCW(this.board)) {
            this.lockTimer = 0; // Сброс таймера фиксации
            this.emit('pieceRotate', 'cw');
        }
    }

    /**
     * Поворачивает текущую фигуру против часовой стрелки
     */
    rotateCCW() {
        if (this.state !== 'playing' || !this.currentPiece || this.board.isAnimatingLineClear()) {
            return;
        }
        
        if (this.currentPiece.rotateCCW(this.board)) {
            this.lockTimer = 0; // Сброс таймера фиксации
            this.emit('pieceRotate', 'ccw');
        }
    }

    /**
     * Включает/выключает мягкое падение
     * @param {boolean} enable - Включить мягкое падение
     */
    setSoftDrop(enable) {
        this.fastDrop = enable;
    }

    /**
     * Выполняет жесткое падение (мгновенное)
     */
    hardDrop() {
        if (this.state !== 'playing' || !this.currentPiece || this.board.isAnimatingLineClear()) {
            return;
        }
        
        const startY = this.currentPiece.y;
        const ghostY = this.board.getGhostPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y);
        const dropDistance = ghostY - startY;
        
        if (dropDistance > 0) {
            this.currentPiece.y = ghostY;
            this.scoreManager.addScore('hardDrop', dropDistance);
            this.emit('scoreUpdate');
        }
        
        // Немедленно фиксируем фигуру
        this.lockPiece();
        
        this.emit('pieceHardDrop', dropDistance);
    }

    /**
     * Получает текущее состояние игры
     * @returns {Object} Состояние игры
     */
    getGameState() {
        return {
            state: this.state,
            board: this.board.getBoard(),
            currentPiece: this.currentPiece,
            nextPiece: this.nextPiece,
            ghostPiece: this.ghostPiece,
            score: this.scoreManager.getScore(),
            level: this.scoreManager.getLevel(),
            lines: this.scoreManager.getLines(),
            lineClearAnimation: this.board.getLineClearAnimation()
        };
    }

    /**
     * Включает/выключает отображение тени
     * @param {boolean} show - Показывать тень
     */
    setShowGhost(show) {
        this.showGhost = show;
        if (!show) {
            this.ghostPiece = null;
        }
    }

    /**
     * Добавляет обработчик события
     * @param {string} event - Название события
     * @param {Function} callback - Функция обработчик
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Удаляет обработчик события
     * @param {string} event - Название события
     * @param {Function} callback - Функция обработчик
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Испускает событие
     * @param {string} event - Название события
     * @param {*} data - Данные события
     */
    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Ошибка в обработчике события ${event}:`, error);
                }
            });
        }
    }

    /**
     * Получает статистику игры для отладки
     * @returns {Object} Статистика
     */
    getDebugInfo() {
        return {
            state: this.state,
            currentPiece: this.currentPiece?.getDebugInfo(),
            boardStats: this.board.getStats(),
            scoreInfo: this.scoreManager.getDebugInfo(),
            dropTimer: this.dropTimer,
            lockTimer: this.lockTimer,
            showGhost: this.showGhost,
            fastDrop: this.fastDrop
        };
    }

    /**
     * Освобождает ресурсы
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.eventListeners.clear();
        this.state = 'stopped';
    }
}