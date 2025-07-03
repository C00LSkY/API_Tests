/**
 * Класс InputHandler - обработка пользовательского ввода
 * Управляет клавиатурой, мышью и touch событиями
 */

import { GAME_CONFIG } from '../utils/Config.js';

export class InputHandler {
    /**
     * Создает новый обработчик ввода
     * @param {Game} game - Экземпляр игры
     */
    constructor(game) {
        this.game = game;
        this.keyState = new Map();
        this.keyRepeatTimers = new Map();
        this.boundHandlers = new Map();
        this.touchStartPos = null;
        this.lastTouchTime = 0;
        
        this.bindEvents();
    }

    /**
     * Устанавливает обработчики событий
     */
    bindEvents() {
        // Клавиатура
        this.boundHandlers.set('keydown', this.handleKeyDown.bind(this));
        this.boundHandlers.set('keyup', this.handleKeyUp.bind(this));
        
        // Touch события
        this.boundHandlers.set('touchstart', this.handleTouchStart.bind(this));
        this.boundHandlers.set('touchmove', this.handleTouchMove.bind(this));
        this.boundHandlers.set('touchend', this.handleTouchEnd.bind(this));
        
        // Добавляем обработчики
        document.addEventListener('keydown', this.boundHandlers.get('keydown'));
        document.addEventListener('keyup', this.boundHandlers.get('keyup'));
        
        // Touch события для canvas
        if (this.game.canvas) {
            this.game.canvas.addEventListener('touchstart', this.boundHandlers.get('touchstart'), { passive: false });
            this.game.canvas.addEventListener('touchmove', this.boundHandlers.get('touchmove'), { passive: false });
            this.game.canvas.addEventListener('touchend', this.boundHandlers.get('touchend'), { passive: false });
        }
    }

    /**
     * Обработчик нажатия клавиш
     * @param {KeyboardEvent} event - Событие клавиатуры
     */
    handleKeyDown(event) {
        const code = event.code;
        
        // Предотвращаем повторные события
        if (this.keyState.get(code)) {
            return;
        }
        
        this.keyState.set(code, true);
        
        // Обрабатываем действие
        this.handleAction(code);
        
        // Настраиваем повтор для движения
        if (this.isMovementKey(code)) {
            this.setKeyRepeat(code);
        }
        
        // Предотвращаем стандартное поведение для игровых клавиш
        if (this.isGameKey(code)) {
            event.preventDefault();
        }
    }

    /**
     * Обработчик отпускания клавиш
     * @param {KeyboardEvent} event - Событие клавиатуры
     */
    handleKeyUp(event) {
        const code = event.code;
        
        this.keyState.set(code, false);
        
        // Отключаем повтор
        this.clearKeyRepeat(code);
        
        // Обрабатываем отпускание
        if (GAME_CONFIG.CONTROLS.SOFT_DROP.includes(code)) {
            this.game.setSoftDrop(false);
        }
    }

    /**
     * Обработчик начала touch
     * @param {TouchEvent} event - Touch событие
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        const touch = event.touches[0];
        this.touchStartPos = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
    }

    /**
     * Обработчик движения touch
     * @param {TouchEvent} event - Touch событие
     */
    handleTouchMove(event) {
        event.preventDefault();
    }

    /**
     * Обработчик окончания touch
     * @param {TouchEvent} event - Touch событие
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        if (!this.touchStartPos) {
            return;
        }
        
        const touch = event.changedTouches[0];
        const endPos = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
        
        const dx = endPos.x - this.touchStartPos.x;
        const dy = endPos.y - this.touchStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const duration = endPos.time - this.touchStartPos.time;
        
        // Определяем тип жеста
        if (distance < 10 && duration < 300) {
            // Короткое нажатие - поворот
            this.game.rotateCW();
        } else if (distance > 30) {
            // Свайп
            if (Math.abs(dx) > Math.abs(dy)) {
                // Горизонтальный свайп
                if (dx > 0) {
                    this.game.moveRight();
                } else {
                    this.game.moveLeft();
                }
            } else {
                // Вертикальный свайп
                if (dy > 0) {
                    this.game.hardDrop();
                } else {
                    this.game.rotateCW();
                }
            }
        }
        
        this.touchStartPos = null;
    }

    /**
     * Обрабатывает игровые действия
     * @param {string} code - Код клавиши
     */
    handleAction(code) {
        // Движение влево
        if (GAME_CONFIG.CONTROLS.MOVE_LEFT.includes(code)) {
            this.game.moveLeft();
        }
        
        // Движение вправо
        else if (GAME_CONFIG.CONTROLS.MOVE_RIGHT.includes(code)) {
            this.game.moveRight();
        }
        
        // Поворот по часовой стрелке
        else if (GAME_CONFIG.CONTROLS.ROTATE_CW.includes(code)) {
            this.game.rotateCW();
        }
        
        // Поворот против часовой стрелки
        else if (GAME_CONFIG.CONTROLS.ROTATE_CCW.includes(code)) {
            this.game.rotateCCW();
        }
        
        // Мягкое падение
        else if (GAME_CONFIG.CONTROLS.SOFT_DROP.includes(code)) {
            this.game.setSoftDrop(true);
        }
        
        // Жесткое падение
        else if (GAME_CONFIG.CONTROLS.HARD_DROP.includes(code)) {
            this.game.hardDrop();
        }
        
        // Пауза
        else if (GAME_CONFIG.CONTROLS.PAUSE.includes(code)) {
            this.game.togglePause();
        }
        
        // Перезапуск
        else if (GAME_CONFIG.CONTROLS.RESTART.includes(code)) {
            if (this.game.getGameState().state === 'gameover') {
                this.game.restart();
            }
        }
    }

    /**
     * Проверяет, является ли клавиша клавишей движения
     * @param {string} code - Код клавиши
     * @returns {boolean} true если клавиша движения
     */
    isMovementKey(code) {
        return GAME_CONFIG.CONTROLS.MOVE_LEFT.includes(code) ||
               GAME_CONFIG.CONTROLS.MOVE_RIGHT.includes(code) ||
               GAME_CONFIG.CONTROLS.SOFT_DROP.includes(code);
    }

    /**
     * Проверяет, является ли клавиша игровой
     * @param {string} code - Код клавиши
     * @returns {boolean} true если игровая клавиша
     */
    isGameKey(code) {
        return Object.values(GAME_CONFIG.CONTROLS).some(keys => 
            Array.isArray(keys) && keys.includes(code)
        );
    }

    /**
     * Устанавливает повтор для клавиши
     * @param {string} code - Код клавиши
     */
    setKeyRepeat(code) {
        // Очищаем предыдущий таймер
        this.clearKeyRepeat(code);
        
        // Устанавливаем новый таймер
        const timer = setTimeout(() => {
            // Начинаем повтор с интервалом
            const interval = setInterval(() => {
                if (this.keyState.get(code)) {
                    this.handleAction(code);
                } else {
                    clearInterval(interval);
                }
            }, GAME_CONFIG.CONTROLS.REPEAT_INTERVAL);
            
            this.keyRepeatTimers.set(code, { type: 'interval', id: interval });
        }, GAME_CONFIG.CONTROLS.REPEAT_DELAY);
        
        this.keyRepeatTimers.set(code, { type: 'timeout', id: timer });
    }

    /**
     * Очищает повтор для клавиши
     * @param {string} code - Код клавиши
     */
    clearKeyRepeat(code) {
        const timer = this.keyRepeatTimers.get(code);
        if (timer) {
            if (timer.type === 'timeout') {
                clearTimeout(timer.id);
            } else if (timer.type === 'interval') {
                clearInterval(timer.id);
            }
            this.keyRepeatTimers.delete(code);
        }
    }

    /**
     * Проверяет, нажата ли клавиша
     * @param {string} code - Код клавиши
     * @returns {boolean} true если нажата
     */
    isKeyPressed(code) {
        return this.keyState.get(code) || false;
    }

    /**
     * Получает состояние всех клавиш
     * @returns {Map} Состояние клавиш
     */
    getKeyStates() {
        return new Map(this.keyState);
    }

    /**
     * Симулирует нажатие клавиши (для тестирования)
     * @param {string} code - Код клавиши
     */
    simulateKeyPress(code) {
        this.handleKeyDown({ code, preventDefault: () => {} });
    }

    /**
     * Симулирует отпускание клавиши (для тестирования)
     * @param {string} code - Код клавиши
     */
    simulateKeyRelease(code) {
        this.handleKeyUp({ code });
    }

    /**
     * Отключает все обработчики событий
     */
    unbindEvents() {
        // Удаляем обработчики клавиатуры
        document.removeEventListener('keydown', this.boundHandlers.get('keydown'));
        document.removeEventListener('keyup', this.boundHandlers.get('keyup'));
        
        // Удаляем touch обработчики
        if (this.game.canvas) {
            this.game.canvas.removeEventListener('touchstart', this.boundHandlers.get('touchstart'));
            this.game.canvas.removeEventListener('touchmove', this.boundHandlers.get('touchmove'));
            this.game.canvas.removeEventListener('touchend', this.boundHandlers.get('touchend'));
        }
        
        // Очищаем таймеры повтора
        this.keyRepeatTimers.forEach((timer, code) => {
            this.clearKeyRepeat(code);
        });
        
        // Очищаем состояние
        this.keyState.clear();
        this.boundHandlers.clear();
    }

    /**
     * Получает информацию для отладки
     * @returns {Object} Отладочная информация
     */
    getDebugInfo() {
        return {
            pressedKeys: Array.from(this.keyState.entries()).filter(([, pressed]) => pressed).map(([code]) => code),
            activeRepeats: Array.from(this.keyRepeatTimers.keys()),
            touchActive: !!this.touchStartPos,
            lastTouchTime: this.lastTouchTime
        };
    }

    /**
     * Освобождает ресурсы
     */
    destroy() {
        this.unbindEvents();
    }
}