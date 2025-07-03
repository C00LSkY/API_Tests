/**
 * Класс SoundManager - управление звуковыми эффектами
 * Отвечает за загрузку, воспроизведение и управление звуками
 */

import { GAME_CONFIG } from '../utils/Config.js';

export class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
        this.currentMusic = null;
        this.audioContext = null;
        this.loadPromises = [];
        
        this.initAudioContext();
    }

    /**
     * Инициализирует Web Audio API контекст
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API не поддерживается:', error);
        }
    }

    /**
     * Загружает все звуковые файлы
     * @returns {Promise} Промис загрузки всех звуков
     */
    async loadSounds() {
        const soundFiles = [
            { name: 'move', url: GAME_CONFIG.SOUNDS.MOVE, type: 'sfx' },
            { name: 'rotate', url: GAME_CONFIG.SOUNDS.ROTATE, type: 'sfx' },
            { name: 'drop', url: GAME_CONFIG.SOUNDS.DROP, type: 'sfx' },
            { name: 'lineClear', url: GAME_CONFIG.SOUNDS.LINE_CLEAR, type: 'sfx' },
            { name: 'tetris', url: GAME_CONFIG.SOUNDS.TETRIS, type: 'sfx' },
            { name: 'levelUp', url: GAME_CONFIG.SOUNDS.LEVEL_UP, type: 'sfx' },
            { name: 'gameOver', url: GAME_CONFIG.SOUNDS.GAME_OVER, type: 'sfx' },
            { name: 'theme', url: GAME_CONFIG.SOUNDS.THEME, type: 'music' }
        ];

        this.loadPromises = soundFiles.map(sound => this.loadSound(sound.name, sound.url, sound.type));
        
        try {
            await Promise.allSettled(this.loadPromises);
            console.log('Звуки загружены');
        } catch (error) {
            console.warn('Ошибка загрузки звуков:', error);
        }
    }

    /**
     * Загружает отдельный звуковой файл
     * @param {string} name - Название звука
     * @param {string} url - URL файла
     * @param {string} type - Тип звука ('sfx' или 'music')
     * @returns {Promise} Промис загрузки
     */
    loadSound(name, url, type) {
        return new Promise((resolve, reject) => {
            // Создаем Audio элемент как fallback
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds.set(name, {
                    audio: audio,
                    type: type,
                    loaded: true
                });
                resolve();
            });
            
            audio.addEventListener('error', (error) => {
                console.warn(`Не удалось загрузить звук ${name}:`, error);
                // Создаем заглушку
                this.sounds.set(name, {
                    audio: null,
                    type: type,
                    loaded: false
                });
                resolve(); // Не блокируем загрузку других звуков
            });
            
            audio.preload = 'auto';
            audio.src = url;
        });
    }

    /**
     * Воспроизводит звуковой эффект
     * @param {string} name - Название звука
     * @param {number} volume - Громкость (0-1), по умолчанию из настроек
     */
    playSound(name, volume = null) {
        if (this.muted) return;
        
        const sound = this.sounds.get(name);
        if (!sound || !sound.loaded || !sound.audio) {
            return;
        }
        
        try {
            const audio = sound.audio.cloneNode();
            const finalVolume = volume !== null ? volume : 
                               (sound.type === 'music' ? this.musicVolume : this.sfxVolume);
            
            audio.volume = Math.max(0, Math.min(1, finalVolume));
            
            // Для звуковых эффектов сбрасываем время воспроизведения
            if (sound.type === 'sfx') {
                audio.currentTime = 0;
            }
            
            audio.play().catch(error => {
                console.warn(`Ошибка воспроизведения звука ${name}:`, error);
            });
            
        } catch (error) {
            console.warn(`Ошибка при попытке воспроизвести звук ${name}:`, error);
        }
    }

    /**
     * Воспроизводит фоновую музыку
     * @param {string} name - Название трека
     * @param {boolean} loop - Зацикливать ли музыку
     */
    playMusic(name, loop = true) {
        if (this.muted) return;
        
        // Останавливаем текущую музыку
        this.stopMusic();
        
        const sound = this.sounds.get(name);
        if (!sound || !sound.loaded || !sound.audio) {
            return;
        }
        
        try {
            const audio = sound.audio;
            audio.volume = this.musicVolume;
            audio.loop = loop;
            audio.currentTime = 0;
            
            this.currentMusic = audio;
            
            audio.play().catch(error => {
                console.warn(`Ошибка воспроизведения музыки ${name}:`, error);
            });
            
        } catch (error) {
            console.warn(`Ошибка при попытке воспроизвести музыку ${name}:`, error);
        }
    }

    /**
     * Останавливает фоновую музыку
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }

    /**
     * Устанавливает громкость музыки
     * @param {number} volume - Громкость (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }

    /**
     * Устанавливает громкость звуковых эффектов
     * @param {number} volume - Громкость (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Устанавливает громкость конкретного звука
     * @param {string} name - Название звука
     * @param {number} volume - Громкость (0-1)
     */
    setSoundVolume(name, volume) {
        const sound = this.sounds.get(name);
        if (sound && sound.audio) {
            sound.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Отключает/включает все звуки
     * @param {boolean} mute - true для отключения звука
     */
    mute(mute = true) {
        this.muted = mute;
        
        if (mute) {
            this.stopMusic();
        }
    }

    /**
     * Включает звук
     */
    unmute() {
        this.mute(false);
    }

    /**
     * Останавливает все звуки
     */
    stopAll() {
        this.stopMusic();
        
        // Останавливаем все звуковые эффекты
        this.sounds.forEach((sound) => {
            if (sound.audio && sound.type === 'sfx') {
                sound.audio.pause();
                sound.audio.currentTime = 0;
            }
        });
    }

    /**
     * Проверяет, поддерживается ли аудио
     * @returns {boolean} true если аудио поддерживается
     */
    isAudioSupported() {
        return !!(window.Audio || window.HTMLAudioElement);
    }

    /**
     * Получает информацию о загруженных звуках
     * @returns {Object} Статистика звуков
     */
    getSoundStats() {
        const total = this.sounds.size;
        const loaded = Array.from(this.sounds.values()).filter(s => s.loaded).length;
        
        return {
            total,
            loaded,
            failed: total - loaded,
            loadingComplete: total === loaded
        };
    }

    /**
     * Создает звуковые эффекты для игровых событий
     */
    createGameSounds() {
        // Если нет реальных звуковых файлов, создаем простые тоны
        if (!this.isAudioSupported() || !this.audioContext) {
            return;
        }

        try {
            this.createBeepSound('move', 220, 0.1);
            this.createBeepSound('rotate', 330, 0.1);
            this.createBeepSound('drop', 110, 0.2);
            this.createBeepSound('lineClear', 440, 0.3);
            this.createBeepSound('tetris', 660, 0.5);
            this.createBeepSound('levelUp', 880, 0.4);
            this.createBeepSound('gameOver', 165, 1.0);
        } catch (error) {
            console.warn('Не удалось создать синтезированные звуки:', error);
        }
    }

    /**
     * Создает простой звуковой тон
     * @param {string} name - Название звука
     * @param {number} frequency - Частота в Гц
     * @param {number} duration - Длительность в секундах
     */
    createBeepSound(name, frequency, duration) {
        if (!this.audioContext) return;

        const sound = {
            audio: null,
            type: 'sfx',
            loaded: true,
            frequency,
            duration,
            synthesized: true
        };

        this.sounds.set(name, sound);
    }

    /**
     * Воспроизводит синтезированный звук
     * @param {string} name - Название звука
     */
    playSynthesizedSound(name) {
        if (!this.audioContext || this.muted) return;

        const sound = this.sounds.get(name);
        if (!sound || !sound.synthesized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = sound.frequency;
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);

        } catch (error) {
            console.warn(`Ошибка воспроизведения синтезированного звука ${name}:`, error);
        }
    }

    /**
     * Переопределенный метод воспроизведения с поддержкой синтеза
     * @param {string} name - Название звука
     * @param {number} volume - Громкость
     */
    play(name, volume = null) {
        const sound = this.sounds.get(name);
        
        if (sound && sound.synthesized) {
            this.playSynthesizedSound(name);
        } else {
            this.playSound(name, volume);
        }
    }

    /**
     * Освобождение ресурсов
     */
    destroy() {
        this.stopAll();
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        this.sounds.clear();
    }
}