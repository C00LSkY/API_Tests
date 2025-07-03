/**
 * Класс Tetromino - представляет игровые фигуры Тетрис
 * Отвечает за вращение, формы и свойства тетромино
 */

import { GAME_CONFIG, TETROMINO_SHAPES, TETROMINO_TYPES, WALL_KICK_DATA } from '../utils/Config.js';

export class Tetromino {
    /**
     * Создает новую фигуру тетромино
     * @param {string} type - Тип фигуры (I, O, T, S, Z, J, L)
     * @param {number} x - Начальная X координата
     * @param {number} y - Начальная Y координата
     */
    constructor(type = null, x = 0, y = 0) {
        this.type = type || this.getRandomType();
        this.x = x;
        this.y = y;
        this.rotation = 0; // 0, 1, 2, 3 для четырех состояний поворота
        this.shape = TETROMINO_SHAPES[this.type];
        this.color = GAME_CONFIG.TETROMINO_COLORS[this.type];
        
        // Устанавливаем начальную позицию в центре поля
        this.x = Math.floor((GAME_CONFIG.BOARD_WIDTH - this.getWidth()) / 2);
        this.y = -this.getHeight(); // Начинаем выше видимого поля
    }

    /**
     * Получает случайный тип тетромино
     * @returns {string} Случайный тип фигуры
     */
    static getRandomType() {
        return TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
    }

    /**
     * Создает случайную фигуру
     * @returns {Tetromino} Новая случайная фигура
     */
    static createRandom() {
        return new Tetromino(this.getRandomType());
    }

    /**
     * Получает текущую форму фигуры с учетом поворота
     * @returns {Array<Array<number>>} Матрица формы фигуры
     */
    getShape() {
        return this.shape[this.rotation];
    }

    /**
     * Получает цвет фигуры
     * @returns {string} Цвет в формате hex
     */
    getColor() {
        return this.color;
    }

    /**
     * Получает тип фигуры
     * @returns {string} Тип фигуры
     */
    getType() {
        return this.type;
    }

    /**
     * Получает ширину текущей формы фигуры
     * @returns {number} Ширина в блоках
     */
    getWidth() {
        const shape = this.getShape();
        return shape[0] ? shape[0].length : 0;
    }

    /**
     * Получает высоту текущей формы фигуры
     * @returns {number} Высота в блоках
     */
    getHeight() {
        return this.getShape().length;
    }

    /**
     * Поворачивает фигуру по часовой стрелке
     * @param {Board} board - Игровое поле для проверки коллизий
     * @returns {boolean} true если поворот успешен
     */
    rotateCW(board = null) {
        return this.rotate(1, board);
    }

    /**
     * Поворачивает фигуру против часовой стрелки
     * @param {Board} board - Игровое поле для проверки коллизий
     * @returns {boolean} true если поворот успешен
     */
    rotateCCW(board = null) {
        return this.rotate(-1, board);
    }

    /**
     * Выполняет поворот фигуры с wall-kick
     * @param {number} direction - Направление поворота (1 или -1)
     * @param {Board} board - Игровое поле для проверки коллизий
     * @returns {boolean} true если поворот успешен
     */
    rotate(direction, board = null) {
        const oldRotation = this.rotation;
        const newRotation = (this.rotation + direction + 4) % 4;
        
        // Временно устанавливаем новый поворот
        this.rotation = newRotation;
        
        // Если нет поля для проверки, просто поворачиваем
        if (!board) {
            return true;
        }
        
        // Проверяем базовую позицию
        if (board.isValidPosition(this, this.x, this.y)) {
            return true;
        }
        
        // Пробуем wall-kick смещения
        const kickData = this.getWallKickData(oldRotation, newRotation);
        
        for (const [dx, dy] of kickData) {
            if (board.isValidPosition(this, this.x + dx, this.y + dy)) {
                this.x += dx;
                this.y += dy;
                return true;
            }
        }
        
        // Если поворот невозможен, возвращаем старое состояние
        this.rotation = oldRotation;
        return false;
    }

    /**
     * Получает данные wall-kick для перехода между поворотами
     * @param {number} fromRotation - Исходный поворот
     * @param {number} toRotation - Целевой поворот
     * @returns {Array<Array<number>>} Массив смещений для попытки
     */
    getWallKickData(fromRotation, toRotation) {
        const transition = `${fromRotation}->${toRotation}`;
        
        // I-фигура имеет особые правила wall-kick
        if (this.type === 'I') {
            return WALL_KICK_DATA.I[transition] || [[0, 0]];
        }
        
        // O-фигура не нуждается в wall-kick
        if (this.type === 'O') {
            return [[0, 0]];
        }
        
        // Остальные фигуры используют стандартные правила
        return WALL_KICK_DATA.JLTSZ[transition] || [[0, 0]];
    }

    /**
     * Перемещает фигуру на указанное смещение
     * @param {number} dx - Смещение по X
     * @param {number} dy - Смещение по Y
     * @param {Board} board - Игровое поле для проверки коллизий
     * @returns {boolean} true если перемещение успешно
     */
    move(dx, dy, board = null) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Если нет поля для проверки, просто перемещаем
        if (!board || board.isValidPosition(this, newX, newY)) {
            this.x = newX;
            this.y = newY;
            return true;
        }
        
        return false;
    }

    /**
     * Перемещает фигуру влево
     * @param {Board} board - Игровое поле для проверки коллизий
     * @returns {boolean} true если перемещение успешно
     */
    moveLeft(board = null) {
        return this.move(-1, 0, board);
    }

    /**
     * Перемещает фигуру вправо
     * @param {Board} board - Игровое поле для проверки коллизий
     * @returns {boolean} true если перемещение успешно
     */
    moveRight(board = null) {
        return this.move(1, 0, board);
    }

    /**
     * Перемещает фигуру вниз
     * @param {Board} board - Игровое поле для проверки коллизий
     * @returns {boolean} true если перемещение успешно
     */
    moveDown(board = null) {
        return this.move(0, 1, board);
    }

    /**
     * Устанавливает позицию фигуры
     * @param {number} x - X координата
     * @param {number} y - Y координата
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Получает позицию фигуры
     * @returns {Object} Объект с координатами {x, y}
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Создает копию фигуры
     * @returns {Tetromino} Новая копия фигуры
     */
    clone() {
        const copy = new Tetromino(this.type, this.x, this.y);
        copy.rotation = this.rotation;
        return copy;
    }

    /**
     * Получает все возможные состояния поворота фигуры
     * @returns {Array<Array<Array<number>>>} Массив всех форм
     */
    getRotationStates() {
        return [...this.shape];
    }

    /**
     * Сбрасывает фигуру в начальное состояние
     */
    reset() {
        this.rotation = 0;
        this.x = Math.floor((GAME_CONFIG.BOARD_WIDTH - this.getWidth()) / 2);
        this.y = -this.getHeight();
    }

    /**
     * Проверяет, находится ли фигура полностью выше игрового поля
     * @returns {boolean} true если фигура выше поля
     */
    isAboveBoard() {
        return this.y + this.getHeight() <= 0;
    }

    /**
     * Получает массив координат всех блоков фигуры
     * @returns {Array<Object>} Массив объектов {x, y} для каждого блока
     */
    getBlockPositions() {
        const positions = [];
        const shape = this.getShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    positions.push({
                        x: this.x + col,
                        y: this.y + row
                    });
                }
            }
        }
        
        return positions;
    }

    /**
     * Получает границы фигуры
     * @returns {Object} Объект с границами {left, right, top, bottom}
     */
    getBounds() {
        const shape = this.getShape();
        let left = shape[0].length;
        let right = -1;
        let top = shape.length;
        let bottom = -1;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    left = Math.min(left, col);
                    right = Math.max(right, col);
                    top = Math.min(top, row);
                    bottom = Math.max(bottom, row);
                }
            }
        }
        
        return {
            left: this.x + left,
            right: this.x + right,
            top: this.y + top,
            bottom: this.y + bottom
        };
    }

    /**
     * Получает информацию о фигуре для отладки
     * @returns {Object} Отладочная информация
     */
    getDebugInfo() {
        return {
            type: this.type,
            position: { x: this.x, y: this.y },
            rotation: this.rotation,
            size: { width: this.getWidth(), height: this.getHeight() },
            bounds: this.getBounds(),
            color: this.color,
            blockCount: this.getBlockPositions().length
        };
    }
}

/**
 * Генератор случайных тетромино с системой "мешка"
 * Гарантирует, что все 7 фигур появятся перед повтором
 */
export class TetrominoBag {
    constructor() {
        this.bag = [];
        this.refillBag();
    }

    /**
     * Заполняет мешок всеми типами фигур
     */
    refillBag() {
        this.bag = [...TETROMINO_TYPES];
        // Перемешиваем мешок
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    /**
     * Получает следующую фигуру из мешка
     * @returns {Tetromino} Новая фигура
     */
    getNext() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        
        const type = this.bag.pop();
        return new Tetromino(type);
    }

    /**
     * Заглядывает в мешок без извлечения фигуры
     * @param {number} count - Количество фигур для просмотра
     * @returns {Array<string>} Массив типов следующих фигур
     */
    peek(count = 1) {
        const result = [];
        const bagCopy = [...this.bag];
        
        for (let i = 0; i < count; i++) {
            if (bagCopy.length === 0) {
                bagCopy.push(...TETROMINO_TYPES);
                // Перемешиваем
                for (let j = bagCopy.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [bagCopy[j], bagCopy[k]] = [bagCopy[k], bagCopy[j]];
                }
            }
            result.push(bagCopy.pop());
        }
        
        return result;
    }
}