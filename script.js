class Timer {
    constructor(counterElement, playBtn, stopBtn, resetBtn, nameInput, id) {
        this.counterElement = counterElement;
        this.playBtn = playBtn;
        this.stopBtn = stopBtn;
        this.resetBtn = resetBtn;
        this.nameInput = nameInput;
        this.id = id;

        this.startTime = 0;
        this.elapsedTime = 0;
        this.intervalId = null;
        this.name = this.nameInput.value || this.id;

        this.playBtn.addEventListener('click', () => this.toggle());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.nameInput.addEventListener('input', () => this.updateName());
    }

    toggle() {
        if (this.isRunning()) {
            this.stop();
        } else {
            this.start();
        }
    }

    isRunning() {
        return Boolean(this.intervalId);
    }

    updateCounter() {
        const time = this.elapsedTime + (Date.now() - this.startTime);
        const hours = Math.floor(time / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((time % (1000 * 60)) / 1000).toString().padStart(2, '0');
        const centiseconds = Math.floor((time % 1000) / 10).toString().padStart(2, '0');
        this.counterElement.textContent = `${hours}:${minutes}:${seconds}.${centiseconds}`;
        updateRanking();
    }

    start(options = {}) {
        const { persist = true } = options;
        if (this.isRunning()) {
            return;
        }
        stopOtherTimers(this);
        this.startTime = Date.now();
        this.intervalId = setInterval(() => this.updateCounter(), 10);
        this.setPlayButtonState("Stop", "2px solid red", "red");
        if (persist && !isRestoringState) {
            persistState();
        }
    }

    stop(options = {}) {
        const { persist = true } = options;
        if (!this.isRunning()) {
            return;
        }
        clearInterval(this.intervalId);
        this.elapsedTime += Date.now() - this.startTime;
        this.intervalId = null;
        this.setPlayButtonState("Play", "2px solid black", "black");
        updateRanking();
        if (persist && !isRestoringState) {
            persistState();
        }
    }

    reset(options = {}) {
        const { persist = true } = options;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.startTime = 0;
        this.elapsedTime = 0;
        this.counterElement.textContent = '00:00:00.00';
        updateRanking();
        this.setPlayButtonState("Play", "2px solid green", "black");
        if (persist && !isRestoringState) {
            persistState();
        }
    }

    setPlayButtonState(label, borderColor, counterColor) {
        this.playBtn.textContent = label;
        this.playBtn.style.border = borderColor;
        this.counterElement.style.color = counterColor;
    }

    getElapsedTime() {
        return this.elapsedTime + (this.intervalId ? Date.now() - this.startTime : 0);
    }

    getFormattedTime() {
        const time = this.getElapsedTime();
        const hours = Math.floor(time / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((time % (1000 * 60)) / 1000).toString().padStart(2, '0');
        const centiseconds = Math.floor((time % 1000) / 10).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}.${centiseconds}`;
    }

    updateName() {
        this.name = this.nameInput.value || this.id;
        updateRanking();
        if (!isRestoringState) {
            persistState();
        }
    }

    setFallbackName(label) {
        this.id = label;
        if (!this.nameInput.value.trim()) {
            this.name = label;
        }
    }

    applyState(state) {
        if (!state) {
            this.reset({ persist: false });
            this.nameInput.value = '';
            this.updateName();
            return;
        }

        this.elapsedTime = Math.max(0, state.elapsedTime || 0);
        this.counterElement.textContent = this.getFormattedTime();
        if (typeof state.nameInputValue === 'string') {
            this.nameInput.value = state.nameInputValue;
            this.updateName();
        }

        if (state.isRunning) {
            this.start({ persist: false });
        } else {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.setPlayButtonState("Play", "2px solid black", "black");
        }
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------

const TOTAL_TIMERS = 6;
const STORAGE_KEY = 'ftv_compteur_state_v1';
const defaultLabels = Array.from({ length: TOTAL_TIMERS }, (_, index) => `Personne ${index + 1}`);
const timers = defaultLabels.map((label, index) => new Timer(
    document.getElementById(`counter${index + 1}`),
    document.getElementById(`playBtn${index + 1}`),
    document.getElementById(`stopBtn${index + 1}`),
    document.getElementById(`resetBtn${index + 1}`),
    document.getElementById(`nameInput${index + 1}`),
    label
));
const counterContainers = Array.from({ length: TOTAL_TIMERS }, (_, index) =>
    document.getElementById(`counter${index + 1}Container`)
);
const rankingBody = document.getElementById('rankingBody');
const timerSelect = document.getElementById('timerSelect');
const resetAllBtn = document.getElementById('reset_all_timer');
const exclusiveToggleState = document.getElementById('exclusiveToggleState');

let exclusiveMode = false;
let visibleTimerCount = TOTAL_TIMERS;
let isRestoringState = false;

const exclusiveToggleBtn = document.getElementById('exclusiveToggle');
if (exclusiveToggleBtn) {
    exclusiveToggleBtn.addEventListener('click', () => {
        exclusiveMode = !exclusiveMode;
        updateExclusiveToggleVisuals();
        if (exclusiveMode) {
            stopOtherTimers();
        }
    });
    updateExclusiveToggleVisuals({ persist: false });
}

function updateExclusiveToggleVisuals(options = {}) {
    const { persist = true } = options;
    if (!exclusiveToggleBtn) {
        return;
    }
    const stateText = exclusiveMode ? 'ON' : 'OFF';
    exclusiveToggleBtn.setAttribute('aria-pressed', exclusiveMode.toString());
    exclusiveToggleBtn.classList.toggle('is-on', exclusiveMode);
    if (exclusiveToggleState) {
        exclusiveToggleState.textContent = stateText;
    }
    if (persist && !isRestoringState) {
        persistState();
    }
}

function stopOtherTimers(currentTimer = null) {
    if (!exclusiveMode) {
        return;
    }

    timers.forEach(timer => {
        if (timer && timer !== currentTimer) {
            timer.stop();
        }
    });
}

// ------------------------------------------------------------------------------------------------------------------------------------------------
//Affichage des compteurs avec listbox SELECT

if (timerSelect) {
    timerSelect.addEventListener('change', (event) => {
        const parsedValue = Number(event.target.value);
        const selectedValue = Number.isFinite(parsedValue) ? parsedValue : TOTAL_TIMERS;
        updateVisibleTimers(selectedValue);
        updateRanking();
    });
}

function updateVisibleTimers(count, options = {}) {
    const { persist = true } = options;
    const safeCount = clamp(count, 0, TOTAL_TIMERS);
    visibleTimerCount = safeCount;
    counterContainers.forEach((container, index) => {
        const shouldShow = index < safeCount;
        if (container) {
            container.style.display = shouldShow ? 'block' : 'none';
        }
        timers[index].setFallbackName(defaultLabels[index]);
        if (!shouldShow) {
            timers[index].stop();
        }
    });
    if (timerSelect) {
        timerSelect.value = safeCount === 0 ? 'none' : safeCount.toString();
    }
    if (persist && !isRestoringState) {
        persistState();
    }
}

function clamp(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
}



// ------------------------------------------------------------------------------------------------------------------------------------------------
// Reset des Timers


// Reset ALL TIMER
if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
        timers.forEach(timer => timer.reset());
    });
}


// ------------------------------------------------------------------------------------------------------------------------------------------------


function updateRanking() {
    if (!rankingBody) {
        return;
    }

    const times = timers
        .map((timer, index) => ({ timer, container: counterContainers[index] }))
        .filter(({ container }) => container && container.style.display !== 'none')
        .map(({ timer }) => ({
            name: timer.name,
            time: timer.getElapsedTime(),
            formattedTime: timer.getFormattedTime(),
        }))
        .sort((a, b) => b.time - a.time);

    rankingBody.innerHTML = '';
    times.forEach(entry => {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        const timeCell = document.createElement('td');

        idCell.textContent = entry.name;
        timeCell.textContent = entry.formattedTime;

        row.appendChild(idCell);
        row.appendChild(timeCell);

rankingBody.appendChild(row);
});
}

function persistState() {
try {
const state = {
exclusiveMode,
visibleCount: visibleTimerCount,
timers: timers.map(timer => ({
elapsedTime: timer.getElapsedTime(),
isRunning: timer.isRunning(),
nameInputValue: timer.nameInput.value,
})),
};

localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
} catch (error) {
console.error('Impossible de sauvegarder les compteurs', error);
}
}

function restoreState() {
let storedState = null;
try {
storedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
} catch (error) {
console.error('Impossible de restaurer les compteurs', error);
}

if (!storedState) {
return false;
}

isRestoringState = true;
exclusiveMode = Boolean(storedState.exclusiveMode);
updateExclusiveToggleVisuals({ persist: false });

visibleTimerCount = clamp(storedState.visibleCount ?? TOTAL_TIMERS, 0, TOTAL_TIMERS);

timers.forEach((timer, index) => {
const timerState = storedState.timers ? storedState.timers[index] : null;
timer.applyState(timerState);
});

updateVisibleTimers(visibleTimerCount, { persist: false });
updateRanking();
isRestoringState = false;
return true;
}

const restored = restoreState();
if (!restored) {
updateVisibleTimers(TOTAL_TIMERS, { persist: false });
updateRanking();
}

// Initialise le classement au chargement de la page.
updateRanking();

// ------------------------------------------------------------------------------------------------------------------------------------------------