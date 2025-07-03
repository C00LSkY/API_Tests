/**
 * Конфигурация игры Тетрис
 * Все основные параметры и настройки игры
 */

export const GAME_CONFIG = {
    // === РАЗМЕРЫ ИГРОВОГО ПОЛЯ ===
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    BLOCK_SIZE: 30,
    
    // === НАСТРОЙКИ СКОРОСТИ ===
    INITIAL_FALL_SPEED: 1000,        // миллисекунды
    SPEED_INCREASE_RATE: 0.9,        // коэффициент ускорения
    MIN_FALL_SPEED: 50,              // минимальная скорость падения
    SOFT_DROP_SPEED: 50,             // скорость при мягком сбросе
    
    // === СИСТЕМА ОЧКОВ ===
    SCORING: {
        SINGLE_LINE: 100,            // за одну линию
        DOUBLE_LINE: 300,            // за две линии
        TRIPLE_LINE: 500,            // за три линии
        TETRIS: 800,                 // за четыре линии (тетрис)
        SOFT_DROP: 1,                // за клетку при мягком сбросе
        HARD_DROP: 2,                // за клетку при жестком сбросе
        LEVEL_MULTIPLIER: true       // умножать на уровень
    },
    
    // === ПРОГРЕССИЯ ===
    LINES_PER_LEVEL: 10,             // линий для повышения уровня
    MAX_LEVEL: 15,                   // максимальный уровень
    
    // === УПРАВЛЕНИЕ ===
    CONTROLS: {
        MOVE_LEFT: ['ArrowLeft', 'KeyA'],
        MOVE_RIGHT: ['ArrowRight', 'KeyD'],
        ROTATE_CW: ['ArrowUp', 'KeyW', 'KeyX'],
        ROTATE_CCW: ['KeyZ'],
        SOFT_DROP: ['ArrowDown', 'KeyS'],
        HARD_DROP: ['Space'],
        PAUSE: ['KeyP', 'Escape'],
        RESTART: ['KeyR'],
        
        // Настройки повтора клавиш
        REPEAT_DELAY: 250,           // задержка перед повтором (мс)
        REPEAT_INTERVAL: 50          // интервал повтора (мс)
    },
    
    // === ЦВЕТА ТЕТРОМИНО ===
    TETROMINO_COLORS: {
        I: '#00FFFF',               // Голубой (I-образная)
        O: '#FFFF00',               // Желтый (квадрат)
        T: '#AA00FF',               // Фиолетовый (T-образная)
        S: '#00FF00',               // Зеленый (S-образная)
        Z: '#FF0000',               // Красный (Z-образная)
        J: '#0000FF',               // Синий (J-образная)
        L: '#FF8800',               // Оранжевый (L-образная)
        EMPTY: '#000000',           // Пустая клетка
        GHOST: '#FFFFFF40',         // Тень фигуры
        GRID: '#333333'             // Сетка
    },
    
    // === ЗВУКОВЫЕ ЭФФЕКТЫ ===
    SOUNDS: {
        MOVE: 'assets/sounds/move.wav',
        ROTATE: 'assets/sounds/rotate.wav',
        DROP: 'assets/sounds/drop.wav',
        LINE_CLEAR: 'assets/sounds/line_clear.wav',
        TETRIS: 'assets/sounds/tetris.wav',
        LEVEL_UP: 'assets/sounds/level_up.wav',
        GAME_OVER: 'assets/sounds/game_over.wav',
        THEME: 'assets/sounds/theme.mp3'
    },
    
    // === НАСТРОЙКИ ОТОБРАЖЕНИЯ ===
    GRAPHICS: {
        SHOW_GRID: true,
        SHOW_GHOST: true,
        SMOOTH_ANIMATIONS: true,
        PARTICLE_EFFECTS: true,
        LINE_CLEAR_ANIMATION_DURATION: 300,  // мс
        PIECE_SPAWN_ANIMATION: true
    },
    
    // === ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ===
    STORAGE_KEYS: {
        HIGH_SCORE: 'tetris_high_score',
        SETTINGS: 'tetris_settings',
        STATISTICS: 'tetris_statistics'
    },
    
    // === НАСТРОЙКИ ПО УМОЛЧАНИЮ ===
    DEFAULT_SETTINGS: {
        musicVolume: 50,
        sfxVolume: 70,
        theme: 'classic',
        showGhost: true,
        showGrid: true,
        keyboardControls: true,
        touchControls: true
    }
};

/**
 * Формы тетромино
 * Каждая фигура представлена в виде матрицы для всех 4 поворотов
 */
export const TETROMINO_SHAPES = {
    I: [
        [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0]
        ]
    ],
    
    O: [
        [
            [1,1],
            [1,1]
        ],
        [
            [1,1],
            [1,1]
        ],
        [
            [1,1],
            [1,1]
        ],
        [
            [1,1],
            [1,1]
        ]
    ],
    
    T: [
        [
            [0,1,0],
            [1,1,1],
            [0,0,0]
        ],
        [
            [0,1,0],
            [0,1,1],
            [0,1,0]
        ],
        [
            [0,0,0],
            [1,1,1],
            [0,1,0]
        ],
        [
            [0,1,0],
            [1,1,0],
            [0,1,0]
        ]
    ],
    
    S: [
        [
            [0,1,1],
            [1,1,0],
            [0,0,0]
        ],
        [
            [0,1,0],
            [0,1,1],
            [0,0,1]
        ],
        [
            [0,0,0],
            [0,1,1],
            [1,1,0]
        ],
        [
            [1,0,0],
            [1,1,0],
            [0,1,0]
        ]
    ],
    
    Z: [
        [
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ],
        [
            [0,0,1],
            [0,1,1],
            [0,1,0]
        ],
        [
            [0,0,0],
            [1,1,0],
            [0,1,1]
        ],
        [
            [0,1,0],
            [1,1,0],
            [1,0,0]
        ]
    ],
    
    J: [
        [
            [1,0,0],
            [1,1,1],
            [0,0,0]
        ],
        [
            [0,1,1],
            [0,1,0],
            [0,1,0]
        ],
        [
            [0,0,0],
            [1,1,1],
            [0,0,1]
        ],
        [
            [0,1,0],
            [0,1,0],
            [1,1,0]
        ]
    ],
    
    L: [
        [
            [0,0,1],
            [1,1,1],
            [0,0,0]
        ],
        [
            [0,1,0],
            [0,1,0],
            [0,1,1]
        ],
        [
            [0,0,0],
            [1,1,1],
            [1,0,0]
        ],
        [
            [1,1,0],
            [0,1,0],
            [0,1,0]
        ]
    ]
};

/**
 * Wall-kick данные для корректного поворота у границ
 * Смещения для каждого перехода между поворотами
 */
export const WALL_KICK_DATA = {
    // Для фигур J, L, T, S, Z
    JLTSZ: {
        '0->1': [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
        '1->0': [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
        '1->2': [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
        '2->1': [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
        '2->3': [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
        '3->2': [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
        '3->0': [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
        '0->3': [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]]
    },
    
    // Для I-фигуры
    I: {
        '0->1': [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
        '1->0': [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
        '1->2': [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
        '2->1': [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
        '2->3': [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
        '3->2': [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
        '3->0': [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
        '0->3': [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]]
    }
};

/**
 * Список типов тетромино для генерации случайных фигур
 */
export const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * Утилита для получения настроек из localStorage
 */
export class SettingsManager {
    static getSettings() {
        try {
            const stored = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.SETTINGS);
            return stored ? { ...GAME_CONFIG.DEFAULT_SETTINGS, ...JSON.parse(stored) } : GAME_CONFIG.DEFAULT_SETTINGS;
        } catch (error) {
            console.warn('Ошибка загрузки настроек:', error);
            return GAME_CONFIG.DEFAULT_SETTINGS;
        }
    }
    
    static saveSettings(settings) {
        try {
            localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.warn('Ошибка сохранения настроек:', error);
        }
    }
    
    static getSetting(key) {
        return this.getSettings()[key];
    }
    
    static setSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    }
}