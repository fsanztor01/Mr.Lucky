// ==========================================
// RITUAL MODE (Pentagram Drag & Drop Mini-Game)
// ==========================================

import ConfettiSystem from './confetti.js';

class RitualMode {
    constructor(audioManager, uiManager, jackpotManager) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.jackpot = jackpotManager;
        this.confetti = new ConfettiSystem('ritualConfetti');

        this.playerName = 'Jugador';
        this.placedItems = new Map(); // slot index -> item element
        this.items = [];
        this.slots = [];
        this.draggedItem = null;
        this.dragOffset = { x: 0, y: 0 };
        this.completedCount = 0;
        this.totalItems = 6;

        // DOM elements
        this.itemsContainer = document.getElementById('ritualItemsContainer');
        this.statusMessage = document.getElementById('ritualStatusMessage');
        this.progressContainer = document.getElementById('ritualProgressContainer');
        this.progressBar = document.getElementById('ritualProgressBar');
        this.progressFill = document.getElementById('ritualProgressFill');
        this.progressText = document.getElementById('ritualProgressText');
        this.progressMessage = document.getElementById('ritualProgressMessage');
        this.resultContainer = document.getElementById('ritualResultContainer');
        this.resultName = document.getElementById('ritualResultName');
        this.resultMessage = document.getElementById('ritualResultMessage');
        this.luckLevel = document.getElementById('ritualLuckLevel');
        this.auraColor = document.getElementById('ritualAuraColor');
        this.blessedNumbersBtn = document.getElementById('ritualBlessedNumbersBtn');
        this.blessedNumbers = document.getElementById('ritualBlessedNumbers');
        this.restartBtn = document.getElementById('ritualRestartBtn');
        this.instruction = document.getElementById('ritualInstruction');

        // Progress bar state
        this.isCharging = false;
        this.progress = 0;
        this.chargeInterval = null;
        this.duration = 3000; // 3 seconds to charge
        this.interval = 50; // Update every 50ms

        this.auraColors = [
            { name: 'Verde bingo', emoji: '🍀', color: '#4CAF50' },
            { name: 'Amarillo resignación', emoji: '💛', color: '#FFC107' },
            { name: 'Morado epicidad', emoji: '💜', color: '#9C27B0' }
        ];

        this.init();
    }

    init() {
        // First, clean up any existing DOM state from previous instances
        this.cleanupDOM();
        
        // Clear any existing intervals
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }
        
        // Reset state before setup
        this.isCharging = false;
        this.progress = 0;
        this.completedCount = 0;
        this.draggedItem = null;
        this.placedItems.clear();
        
        // Setup elements
        this.setupItems();
        this.setupSlots();
        
        // Reset UI and state after setup
        this.reset();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    cleanupDOM() {
        // Remove all placed items from pentagram container
        const pentagramContainer = document.querySelector('.ritual-pentagram-container');
        if (pentagramContainer) {
            const placedItems = pentagramContainer.querySelectorAll('.placed-in-slot');
            placedItems.forEach(item => item.remove());
        }
        
        // Reset all slots visually
        const allSlots = document.querySelectorAll('.ritual-slot');
        allSlots.forEach(slot => {
            slot.classList.remove('filled', 'correct', 'drag-over');
            const slotFrame = slot.querySelector('.slot-frame');
            if (slotFrame) {
                slotFrame.classList.remove('filled');
            }
        });
        
        // Reset all items to visible and in container
        const allItems = document.querySelectorAll('.ritual-item');
        allItems.forEach(item => {
            item.style.display = 'block';
            item.classList.remove('placed', 'dragging');
            item.style.position = '';
            item.style.left = '';
            item.style.top = '';
            item.style.transform = '';
            item.style.opacity = '1';
            item.style.zIndex = '';
            item.style.pointerEvents = '';
            
            // Ensure item is in container
            if (this.itemsContainer && item.parentElement !== this.itemsContainer) {
                this.itemsContainer.appendChild(item);
            }
        });
        
        // Reset UI elements
        if (this.progressContainer) {
            this.progressContainer.style.display = 'none';
        }
        if (this.resultContainer) {
            this.resultContainer.style.display = 'none';
        }
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        if (this.progressText) {
            this.progressText.textContent = '0%';
        }
        if (this.progressMessage) {
            this.progressMessage.textContent = '';
        }
        if (this.statusMessage) {
            this.statusMessage.textContent = '';
            this.statusMessage.className = 'ritual-status-message';
        }
        if (this.instruction) {
            this.instruction.textContent = 'Coloca los objetos en el pentagrama para completar el ritual';
            this.instruction.style.display = 'block';
        }
        if (this.blessedNumbers) {
            this.blessedNumbers.style.display = 'none';
        }
    }

    reset() {
        // Clear progress interval if running
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }
        
        // Reset all state variables
        this.placedItems.clear();
        this.completedCount = 0;
        this.draggedItem = null;
        this.progress = 0;
        this.isCharging = false;
        
        // Reset UI elements
        if (this.resultContainer) {
            this.resultContainer.style.display = 'none';
        }
        if (this.progressContainer) {
            this.progressContainer.style.display = 'none';
        }
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        if (this.progressText) {
            this.progressText.textContent = '0%';
        }
        if (this.progressMessage) {
            this.progressMessage.textContent = '';
        }
        if (this.statusMessage) {
            this.statusMessage.textContent = '';
            this.statusMessage.className = 'ritual-status-message';
        }
        if (this.blessedNumbers) {
            this.blessedNumbers.style.display = 'none';
        }
        
        if (this.instruction) {
            this.instruction.textContent = 'Coloca los objetos en el pentagrama para completar el ritual';
            this.instruction.style.display = 'block';
        }

        // Reset all slots - remove placed items
        const pentagramContainer = document.querySelector('.ritual-pentagram-container');
        if (pentagramContainer) {
            const placedItems = pentagramContainer.querySelectorAll('.placed-in-slot');
            placedItems.forEach(item => item.remove());
        }
        
        // Reset slots only if they exist
        if (this.slots && this.slots.length > 0) {
            this.slots.forEach(slot => {
                slot.classList.remove('filled', 'correct', 'drag-over');
                const slotFrame = slot.querySelector('.slot-frame');
                if (slotFrame) {
                    slotFrame.classList.remove('filled');
                }
            });
        }

        // Reset all items - restore to container
        if (this.items && this.items.length > 0) {
            this.items.forEach(item => {
                item.style.display = 'block';
                item.classList.remove('placed', 'dragging');
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
                item.style.transform = '';
                item.style.opacity = '1';
                item.style.zIndex = '';
                item.style.pointerEvents = '';
                
                // Ensure item is in container
                if (this.itemsContainer && item.parentElement !== this.itemsContainer) {
                    this.itemsContainer.appendChild(item);
                }
            });
        }
    }

    setupItems() {
        this.items = Array.from(this.itemsContainer.querySelectorAll('.ritual-item'));
        this.items.forEach((item, index) => {
            item.dataset.originalIndex = index;
        });
    }

    setupSlots() {
        this.slots = Array.from(document.querySelectorAll('.ritual-slot'));
    }

    setupEventListeners() {
        // Drag events for desktop
        this.items.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e, item));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e, item));
        });

        // Drop events for slots
        this.slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e, slot));
            slot.addEventListener('drop', (e) => this.handleDrop(e, slot));
            slot.addEventListener('dragenter', (e) => this.handleDragEnter(e, slot));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e, slot));
        });

        // Touch events for mobile
        this.items.forEach(item => {
            item.addEventListener('touchstart', (e) => this.handleTouchStart(e, item), { passive: false });
            item.addEventListener('touchmove', (e) => this.handleTouchMove(e, item), { passive: false });
            item.addEventListener('touchend', (e) => this.handleTouchEnd(e, item), { passive: false });
        });

        // Other buttons
        if (this.blessedNumbersBtn) {
            this.blessedNumbersBtn.addEventListener('click', () => this.showBlessedNumbers());
        }
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => this.reset());
        }
    }

    // Desktop drag handlers
    handleDragStart(e, item) {
        if (item.classList.contains('placed')) {
            e.preventDefault();
            return;
        }
        this.draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.innerHTML);
    }

    handleDragEnd(e, item) {
        item.classList.remove('dragging');
        this.slots.forEach(slot => slot.classList.remove('drag-over'));
    }

    handleDragOver(e, slot) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e, slot) {
        e.preventDefault();
        if (!slot.classList.contains('filled')) {
            // Sin feedback visual obvio
        }
    }

    handleDragLeave(e, slot) {
        slot.classList.remove('drag-over');
    }

    handleDrop(e, slot) {
        e.preventDefault();
        slot.classList.remove('drag-over');

        if (!this.draggedItem || slot.classList.contains('filled')) {
            return;
        }

        const correctEmoji = slot.dataset.emoji;
        const itemEmoji = this.draggedItem.dataset.emoji;

        if (correctEmoji === itemEmoji) {
            this.placeItemCorrectly(this.draggedItem, slot);
        } else {
            this.returnItemToStart(this.draggedItem);
        }

        this.draggedItem = null;
    }

    // Mobile touch handlers
    handleTouchStart(e, item) {
        if (item.classList.contains('placed')) {
            return;
        }

        e.preventDefault();
        this.draggedItem = item;
        item.classList.add('dragging');

        const touch = e.touches[0];
        const rect = item.getBoundingClientRect();
        this.dragOffset.x = touch.clientX - rect.left - rect.width / 2;
        this.dragOffset.y = touch.clientY - rect.top - rect.height / 2;

        // Move item to touch position
        item.style.position = 'fixed';
        item.style.left = (touch.clientX - rect.width / 2) + 'px';
        item.style.top = (touch.clientY - rect.height / 2) + 'px';
        item.style.zIndex = '1000';
        item.style.pointerEvents = 'none';
    }

    handleTouchMove(e, item) {
        if (!this.draggedItem || this.draggedItem !== item) return;

        e.preventDefault();
        const touch = e.touches[0];

        item.style.left = (touch.clientX - item.offsetWidth / 2) + 'px';
        item.style.top = (touch.clientY - item.offsetHeight / 2) + 'px';

        // Sin feedback visual al arrastrar
    }

    handleTouchEnd(e, item) {
        if (!this.draggedItem || this.draggedItem !== item) return;

        e.preventDefault();
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const slot = elementBelow?.closest('.ritual-slot');

        item.classList.remove('dragging');
        item.style.pointerEvents = '';
        item.style.zIndex = '';

        // Sin feedback visual

        if (slot && !slot.classList.contains('filled')) {
            const correctEmoji = slot.dataset.emoji;
            const itemEmoji = item.dataset.emoji;

            if (correctEmoji === itemEmoji) {
                this.placeItemCorrectly(item, slot);
            } else {
                this.returnItemToStart(item);
            }
        } else {
            this.returnItemToStart(item);
        }

        this.draggedItem = null;
    }

    placeItemCorrectly(item, slot) {
        // Remove from items container
        item.style.display = 'none';
        item.classList.add('placed');

        // Place in slot
        slot.classList.add('filled', 'correct');
        const slotFrame = slot.querySelector('.slot-frame');
        if (slotFrame) {
            slotFrame.classList.add('filled');
        }

        // Get slot center position - use getBoundingClientRect for accurate position
        const slotRect = slot.getBoundingClientRect();
        const pentagramContainer = slot.closest('.ritual-pentagram-container');
        const containerRect = pentagramContainer.getBoundingClientRect();
        
        // Calculate perfect center position relative to container
        const slotCenterX = slotRect.left + slotRect.width / 2 - containerRect.left;
        const slotCenterY = slotRect.top + slotRect.height / 2 - containerRect.top;

        // Add item to slot - perfectly centered
        const itemClone = item.cloneNode(true);
        itemClone.classList.add('placed-in-slot');
        itemClone.style.display = 'flex';
        itemClone.style.position = 'absolute';
        itemClone.style.left = slotCenterX + 'px';
        itemClone.style.top = slotCenterY + 'px';
        itemClone.style.transform = 'translate(-50%, -50%)';
        itemClone.style.width = item.offsetWidth + 'px';
        itemClone.style.height = item.offsetHeight + 'px';
        itemClone.style.margin = '0';
        itemClone.style.padding = '0';
        itemClone.style.pointerEvents = 'none';
        itemClone.style.zIndex = '10';
        itemClone.style.alignItems = 'center';
        itemClone.style.justifyContent = 'center';
        
        // Append to pentagram container for absolute positioning
        pentagramContainer.style.position = 'relative';
        pentagramContainer.appendChild(itemClone);

        // Store placement
        const slotIndex = parseInt(slot.dataset.slot);
        this.placedItems.set(slotIndex, item);
        this.completedCount++;

        // Animation
        this.animateCorrectPlacement(itemClone);
        this.audio.playSuccess();

        // Check if complete - start charging progress bar
        if (this.completedCount === this.totalItems) {
            // Ensure we're not already charging
            if (!this.isCharging) {
                setTimeout(() => {
                    // Double check before starting - verify state is still valid
                    if (this.completedCount === this.totalItems && !this.isCharging && this.slots) {
                        // Verify all slots are filled
                        const allFilled = Array.from(this.slots).every(slot => slot.classList.contains('filled'));
                        if (allFilled) {
                            this.startCharging();
                        }
                    }
                }, 500);
            }
        } else {
            this.updateStatusMessage();
        }
    }

    returnItemToStart(item) {
        item.classList.remove('dragging');
        item.style.position = '';
        item.style.left = '';
        item.style.top = '';
        item.style.transform = '';
        item.style.zIndex = '';

        // Animation
        this.animateIncorrectPlacement(item);
        this.audio.playFail();
    }

    animateCorrectPlacement(itemElement) {
        // Reset animation
        itemElement.style.animation = 'none';
        void itemElement.offsetWidth; // Force reflow
        
        // Apply animation to the placed item
        itemElement.style.animation = 'itemPlaced 0.6s ease-out';

        // Launch mini confetti
        this.confetti.launch(30);
    }

    animateIncorrectPlacement(item) {
        item.style.animation = 'none';
        setTimeout(() => {
            item.style.animation = 'itemReturn 0.4s ease-out';
        }, 10);
    }

    updateStatusMessage() {
        const remaining = this.totalItems - this.completedCount;
        if (remaining > 0) {
            this.statusMessage.textContent = `Coloca ${remaining} objeto${remaining > 1 ? 's' : ''} más...`;
            this.statusMessage.className = 'ritual-status-message';
        }
    }

    startCharging() {
        // Prevent multiple charging processes
        if (this.isCharging) {
            return;
        }

        // Clear any existing interval first
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }

        this.isCharging = true;
        this.progress = 0;
        
        // Hide instruction and show progress bar
        if (this.instruction) {
            this.instruction.style.display = 'none';
        }
        if (this.progressContainer) {
            this.progressContainer.style.display = 'block';
        }
        if (this.statusMessage) {
            this.statusMessage.textContent = '';
        }
        
        // Reset progress bar
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        if (this.progressText) {
            this.progressText.textContent = '0%';
        }
        if (this.progressMessage) {
            this.progressMessage.textContent = 'Conectando con el universo...';
        }
        
        // Start charging
        this.chargeInterval = setInterval(() => {
            if (!this.isCharging) {
                clearInterval(this.chargeInterval);
                this.chargeInterval = null;
                return;
            }
            
            this.progress += (100 / this.duration) * this.interval;
            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(this.chargeInterval);
                this.chargeInterval = null;
                this.completeRitual();
            } else {
                this.updateProgress(this.progress);
                this.updateProgressMessage(this.progress);
            }
        }, this.interval);
    }

    updateProgress(progress) {
        this.progressFill.style.width = progress + '%';
        this.progressText.textContent = Math.round(progress) + '%';
    }

    updateProgressMessage(progress) {
        const messages = [
            { min: 0, max: 20, text: 'Conectando con el universo...' },
            { min: 20, max: 40, text: 'Sobornando a la diosa Fortuna...' },
            { min: 40, max: 60, text: 'Inflando el karma del equipo...' },
            { min: 60, max: 80, text: 'Ajustando la vibración de bingo...' },
            { min: 80, max: 100, text: 'Cargando suerte al máximo...' }
        ];

        const currentMessage = messages.find(msg => progress >= msg.min && progress < msg.max);
        if (currentMessage) {
            this.progressMessage.textContent = currentMessage.text;
        }
    }

    completeRitual() {
        // Mark charging as complete
        this.isCharging = false;
        
        // Update progress to 100%
        this.updateProgress(100);
        if (this.progressMessage) {
            this.progressMessage.textContent = '¡Suerte cargada al máximo! ✨';
        }

        // Calculate luck level based on performance
        const luckLevel = Math.min(5, Math.floor(Math.random() * 3) + 3 + 1);
        const auraIndex = Math.floor(Math.random() * this.auraColors.length);
        const aura = this.auraColors[auraIndex];

        // Show confetti
        this.confetti.launch(300);
        this.audio.playSuccess();

        // Hide progress bar and show result
        setTimeout(() => {
            if (this.progressContainer) {
                this.progressContainer.style.display = 'none';
            }
            this.showResult(luckLevel, aura);
        }, 800);
    }

    showResult(luckLevel, aura) {
        this.resultContainer.style.display = 'block';
        this.resultName.textContent = this.playerName;
        
        const resultMessages = [
            `🎉 ${this.playerName} tiene la SUERTE AL MÁXIMO. Si no cantas línea hoy, es porque el universo tiene otros planes.`,
            `✨ ${this.playerName} está cargado de buena energía. ¡Hoy es tu día de suerte!`,
            `🌟 ${this.playerName} ha alcanzado el nivel máximo de fortuna. ¡Que los números te acompañen!`
        ];
        const randomMessage = resultMessages[Math.floor(Math.random() * resultMessages.length)];
        this.resultMessage.textContent = randomMessage;

        // Show luck level
        const stars = '⭐'.repeat(luckLevel);
        this.luckLevel.textContent = `Nivel de suerte: ${stars}`;

        // Show aura color
        this.auraColor.innerHTML = `Color de aura: <span style="color: ${aura.color}">${aura.emoji} ${aura.name}</span>`;

        // Update status
        this.statusMessage.textContent = '¡Ritual completado con éxito! ✨';
        this.statusMessage.className = 'ritual-status-message success';
    }

    showBlessedNumbers() {
        // Generate 5 random numbers between 1 and 90 (bingo range)
        const numbers = [];
        while (numbers.length < 5) {
            const num = Math.floor(Math.random() * 90) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        numbers.sort((a, b) => a - b);

        const numbersText = numbers.join(' · ');
        this.blessedNumbers.textContent = `Tus números con buena vibra: ${numbersText}`;
        this.blessedNumbers.style.display = 'block';
    }

    destroy() {
        // Clear progress interval if running
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }
        
        // Reset state
        this.isCharging = false;
        this.progress = 0;
        this.completedCount = 0;
        this.placedItems.clear();
        
        // Clear confetti
        if (this.confetti) {
            this.confetti.clear();
        }
    }
}

export default RitualMode;
