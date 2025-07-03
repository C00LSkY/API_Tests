/**
 * Главный файл приложения Тетрис
 * Инициализирует игру и управляет пользовательским интерфейсом
 */

import { Game } from './core/Game.js';
import { Renderer } from './graphics/Renderer.js';
import { InputHandler } from './core/InputHandler.js';
import { SettingsManager } from './utils/Config.js';

class TetrisApp {
    constructor() {
        this.game = null;
        this.renderer = null;
        this.inputHandler = null;
        this.isInitialized = false;
        
        // UI элементы
        this.screens = {
            menu: document.getElementById('main-menu'),
            game: document.getElementById('game-screen'),
            gameover: document.getElementById('gameover-screen')
        };
        
        this.canvases = {
            main: document.getElementById('game-canvas'),
            next: document.getElementById('next-canvas')
        };
        
        this.uiElements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lines: document.getElementById('lines'),
            finalScore: document.getElementById('final-score'),
            finalLevel: document.getElementById('final-level'),
            finalLines: document.getElementById('final-lines'),
            newRecord: document.getElementById('new-record'),
            overlay: document.getElementById('game-overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message')
        };
        
        this.buttons = {
            play: document.getElementById('play-btn'),
            settings: document.getElementById('settings-btn'),
            pause: document.getElementById('pause-btn'),
            restart: document.getElementById('restart-btn'),
            menu: document.getElementById('menu-btn'),
            playAgain: document.getElementById('play-again-btn'),
            backToMenu: document.getElementById('back-to-menu-btn')
        };
        
        this.currentScreen = 'menu';
        this.animationId = null;
        
        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        try {
            // Создаем игровые компоненты
            this.game = new Game(this.canvases.main);
            this.renderer = new Renderer(this.canvases.main, this.canvases.next);
            this.inputHandler = new InputHandler(this.game);
            
            // Настраиваем обработчики событий
            this.setupEventListeners();
            this.setupGameEventListeners();
            
            // Загружаем настройки
            this.loadSettings();
            
            // Запускаем цикл отрисовки
            this.startRenderLoop();
            
            this.isInitialized = true;
            console.log('Игра Тетрис инициализирована успешно');
            
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
            this.showError('Ошибка загрузки игры. Перезагрузите страницу.');
        }
    }

    /**
     * Настройка обработчиков UI событий
     */
    setupEventListeners() {
        // Кнопки главного меню
        this.buttons.play?.addEventListener('click', () => this.startGame());
        this.buttons.settings?.addEventListener('click', () => this.showSettings());
        
        // Кнопки игрового экрана
        this.buttons.pause?.addEventListener('click', () => this.togglePause());
        this.buttons.restart?.addEventListener('click', () => this.restartGame());
        this.buttons.menu?.addEventListener('click', () => this.returnToMenu());
        
        // Кнопки экрана окончания игры
        this.buttons.playAgain?.addEventListener('click', () => this.startGame());
        this.buttons.backToMenu?.addEventListener('click', () => this.returnToMenu());
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Настройка обработчиков игровых событий
     */
    setupGameEventListeners() {
        if (!this.game) return;
        
        // События игры
        this.game.on('gameStart', () => this.onGameStart());
        this.game.on('gamePause', () => this.onGamePause());
        this.game.on('gameResume', () => this.onGameResume());
        this.game.on('gameOver', (data) => this.onGameOver(data));
        this.game.on('scoreUpdate', () => this.updateUI());
        this.game.on('linesCleared', (count) => this.onLinesCleared(count));
        this.game.on('pieceSpawned', (type) => this.onPieceSpawned(type));
    }

    /**
     * Запуск игры
     */
    startGame() {
        if (!this.isInitialized) return;
        
        this.game.restart();
        this.showScreen('game');
        this.game.start();
        this.updateUI();
    }

    /**
     * Переключение паузы
     */
    togglePause() {
        if (!this.game) return;
        
        this.game.togglePause();
    }

    /**
     * Перезапуск игры
     */
    restartGame() {
        if (!this.game) return;
        
        this.game.restart();
        this.game.start();
        this.updateUI();
    }

    /**
     * Возврат в главное меню
     */
    returnToMenu() {
        if (this.game) {
            this.game.pause();
        }
        this.showScreen('menu');
    }

    /**
     * Отображение экрана
     * @param {string} screenName - Название экрана
     */
    showScreen(screenName) {
        // Скрываем все экраны
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }

    /**
     * Обновление пользовательского интерфейса
     */
    updateUI() {
        if (!this.game) return;
        
        const gameState = this.game.getGameState();
        
        // Обновляем счетчики
        if (this.uiElements.score) {
            this.uiElements.score.textContent = gameState.score.toLocaleString();
        }
        
        if (this.uiElements.level) {
            this.uiElements.level.textContent = gameState.level;
        }
        
        if (this.uiElements.lines) {
            this.uiElements.lines.textContent = gameState.lines;
        }
    }

    /**
     * Запуск цикла отрисовки
     */
    startRenderLoop() {
        const render = (timestamp) => {
            if (this.game && this.renderer) {
                const gameState = this.game.getGameState();
                this.renderer.render(gameState);
            }
            
            this.animationId = requestAnimationFrame(render);
        };
        
        render();
    }

    /**
     * Обработчик начала игры
     */
    onGameStart() {
        this.hideOverlay();
        console.log('Игра началась');
    }

    /**
     * Обработчик паузы игры
     */
    onGamePause() {
        this.showOverlay('ПАУЗА', 'Нажмите P для продолжения');
    }

    /**
     * Обработчик возобновления игры
     */
    onGameResume() {
        this.hideOverlay();
    }

    /**
     * Обработчик окончания игры
     * @param {Object} data - Данные об окончании игры
     */
    onGameOver(data) {
        this.showScreen('gameover');
        
        // Обновляем финальные результаты
        if (this.uiElements.finalScore) {
            this.uiElements.finalScore.textContent = data.score.toLocaleString();
        }
        
        if (this.uiElements.finalLevel) {
            this.uiElements.finalLevel.textContent = data.level;
        }
        
        if (this.uiElements.finalLines) {
            this.uiElements.finalLines.textContent = data.lines;
        }
        
        // Показываем индикатор нового рекорда
        if (data.isNewRecord && this.uiElements.newRecord) {
            this.uiElements.newRecord.classList.remove('hidden');
        } else if (this.uiElements.newRecord) {
            this.uiElements.newRecord.classList.add('hidden');
        }
        
        console.log('Игра окончена:', data);
    }

    /**
     * Обработчик очистки линий
     * @param {number} count - Количество очищенных линий
     */
    onLinesCleared(count) {
        console.log(`Очищено линий: ${count}`);
        
        // Можно добавить визуальные эффекты
        if (count === 4) {
            console.log('ТЕТРИС!');
        }
    }

    /**
     * Обработчик появления новой фигуры
     * @param {string} type - Тип фигуры
     */
    onPieceSpawned(type) {
        console.log(`Новая фигура: ${type}`);
    }

    /**
     * Показать оверлей
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     */
    showOverlay(title, message) {
        if (this.uiElements.overlayTitle) {
            this.uiElements.overlayTitle.textContent = title;
        }
        
        if (this.uiElements.overlayMessage) {
            this.uiElements.overlayMessage.textContent = message;
        }
        
        if (this.uiElements.overlay) {
            this.uiElements.overlay.classList.remove('hidden');
        }
    }

    /**
     * Скрыть оверлей
     */
    hideOverlay() {
        if (this.uiElements.overlay) {
            this.uiElements.overlay.classList.add('hidden');
        }
    }

    /**
     * Показать настройки
     */
    showSettings() {
        console.log('Показ настроек - будет реализовано позже');
        // TODO: Реализовать модальное окно настроек
    }

    /**
     * Загрузка настроек
     */
    loadSettings() {
        const settings = SettingsManager.getSettings();
        
        // Применяем тему
        if (settings.theme !== 'classic') {
            document.body.classList.add(`theme-${settings.theme}`);
        }
        
        // Применяем настройки отображения
        if (this.game) {
            this.game.setShowGhost(settings.showGhost);
        }
        
        console.log('Настройки загружены:', settings);
    }

    /**
     * Обработка изменения размера окна
     */
    handleResize() {
        // При необходимости можно добавить адаптивное изменение размера canvas
        console.log('Изменение размера окна');
    }

    /**
     * Показать ошибку
     * @param {string} message - Текст ошибки
     */
    showError(message) {
        alert(message); // Простое решение, можно улучшить
    }

    /**
     * Освобождение ресурсов
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.inputHandler) {
            this.inputHandler.destroy();
        }
        
        if (this.game) {
            this.game.destroy();
        }
        
        console.log('Приложение Тетрис остановлено');
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new TetrisApp();
    
    // Глобальный доступ для отладки
    window.tetrisApp = app;
    
    // Обработка закрытия страницы
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });
});