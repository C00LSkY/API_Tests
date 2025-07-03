/**
 * Класс ScoreManager - управление очками и прогрессией в игре
 * Отвечает за подсчет очков, уровни и сохранение рекордов
 */

import { GAME_CONFIG } from '../utils/Config.js';

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.highScore = this.loadHighScore();
        this.newRecord = false;
    }

    /**
     * Добавляет очки за различные действия
     * @param {string} action - Тип действия ('clearLines', 'softDrop', 'hardDrop')
     * @param {number} value - Значение (количество линий, клеток и т.д.)
     */
    addScore(action, value) {
        let points = 0;
        
        switch (action) {
            case 'clearLines':
                points = this.getLineClearScore(value);
                this.lines += value;
                this.checkLevelUp();
                break;
                
            case 'softDrop':
                points = value * GAME_CONFIG.SCORING.SOFT_DROP;
                break;
                
            case 'hardDrop':
                points = value * GAME_CONFIG.SCORING.HARD_DROP;
                break;
        }
        
        this.score += points;
        
        // Проверяем новый рекорд
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.newRecord = true;
        }
    }

    /**
     * Вычисляет очки за очистку линий
     * @param {number} linesCount - Количество очищенных линий
     * @returns {number} Количество очков
     */
    getLineClearScore(linesCount) {
        let baseScore = 0;
        
        switch (linesCount) {
            case 1:
                baseScore = GAME_CONFIG.SCORING.SINGLE_LINE;
                break;
            case 2:
                baseScore = GAME_CONFIG.SCORING.DOUBLE_LINE;
                break;
            case 3:
                baseScore = GAME_CONFIG.SCORING.TRIPLE_LINE;
                break;
            case 4:
                baseScore = GAME_CONFIG.SCORING.TETRIS;
                break;
            default:
                baseScore = 0;
        }
        
        // Умножаем на уровень если включено
        if (GAME_CONFIG.SCORING.LEVEL_MULTIPLIER) {
            baseScore *= this.level;
        }
        
        return baseScore;
    }

    /**
     * Проверяет и повышает уровень
     */
    checkLevelUp() {
        const newLevel = Math.floor(this.lines / GAME_CONFIG.LINES_PER_LEVEL) + 1;
        
        if (newLevel > this.level && newLevel <= GAME_CONFIG.MAX_LEVEL) {
            this.level = newLevel;
            return true;
        }
        
        return false;
    }

    /**
     * Получает скорость падения для текущего уровня
     * @returns {number} Скорость в миллисекундах
     */
    getDropSpeed() {
        const speed = GAME_CONFIG.INITIAL_FALL_SPEED * 
                     Math.pow(GAME_CONFIG.SPEED_INCREASE_RATE, this.level - 1);
        
        return Math.max(speed, GAME_CONFIG.MIN_FALL_SPEED);
    }

    /**
     * Получает текущий счет
     * @returns {number} Счет
     */
    getScore() {
        return this.score;
    }

    /**
     * Получает текущий уровень
     * @returns {number} Уровень
     */
    getLevel() {
        return this.level;
    }

    /**
     * Получает количество очищенных линий
     * @returns {number} Линии
     */
    getLines() {
        return this.lines;
    }

    /**
     * Получает лучший результат
     * @returns {number} Рекорд
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Проверяет, установлен ли новый рекорд
     * @returns {boolean} true если новый рекорд
     */
    isNewRecord() {
        return this.newRecord;
    }

    /**
     * Загружает рекорд из localStorage
     * @returns {number} Сохраненный рекорд
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE);
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('Ошибка загрузки рекорда:', error);
            return 0;
        }
    }

    /**
     * Сохраняет рекорд в localStorage
     */
    saveHighScore() {
        try {
            localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE, this.highScore.toString());
        } catch (error) {
            console.warn('Ошибка сохранения рекорда:', error);
        }
    }

    /**
     * Сбрасывает статистику для новой игры
     */
    reset() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.newRecord = false;
    }

    /**
     * Получает отладочную информацию
     * @returns {Object} Информация для отладки
     */
    getDebugInfo() {
        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            highScore: this.highScore,
            newRecord: this.newRecord,
            dropSpeed: this.getDropSpeed(),
            linesToNextLevel: GAME_CONFIG.LINES_PER_LEVEL - (this.lines % GAME_CONFIG.LINES_PER_LEVEL)
        };
    }
}