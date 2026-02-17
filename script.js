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

        const baseElapsed = Math.max(0, state.elapsedTime || 0);
        const lastStartTime = typeof state.lastStartTime === 'number' ? state.lastStartTime : null;
        const wasRunning = Boolean(state.isRunning);
        const runningDelta = wasRunning && lastStartTime ? Math.max(0, Date.now() - lastStartTime) : 0;

        this.elapsedTime = baseElapsed;

        if (typeof state.nameInputValue === 'string') {
            this.nameInput.value = state.nameInputValue;
            this.updateName();
        }

        if (wasRunning) {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            this.startTime = Date.now() - runningDelta;
            this.intervalId = setInterval(() => this.updateCounter(), 10);
            this.setPlayButtonState("Stop", "2px solid red", "red");
            this.counterElement.textContent = this.getFormattedTime();
        } else {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.startTime = 0;
            this.counterElement.textContent = this.getFormattedTime();
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
const emailExportBtn = document.getElementById('email_export');
const exclusiveToggleState = document.getElementById('exclusiveToggleState');

// Éléments statistiques
const averageTimeElement = document.getElementById('averageTime');
const toleranceSelect = document.getElementById('toleranceSelect');
const equityIndicator = document.getElementById('equityIndicator');
const globalAlert = document.getElementById('globalAlert');
const deviationBody = document.getElementById('deviationBody');

// Références aux indicateurs de temps de parole
const speakingIndicators = Array.from({ length: TOTAL_TIMERS }, (_, index) =>
    document.getElementById(`speakingIndicator${index + 1}`)
);

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

// Écouteur pour le changement de seuil de tolérance
if (toleranceSelect) {
    toleranceSelect.addEventListener('change', () => {
        updateStatistics();
        updateSpeakingIndicators();
        if (!isRestoringState) {
            persistState();
        }
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

// Email Export
if (emailExportBtn) {
    emailExportBtn.addEventListener('click', () => {
        generateEmailExport();
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

    // Calculer la moyenne pour déterminer les écarts
    const totalTime = times.reduce((sum, entry) => sum + entry.time, 0);
    const averageTime = times.length > 0 ? totalTime / times.length : 0;
    
    // Trouver le temps maximum pour normaliser les barres
    const maxTime = times.length > 0 ? times[0].time : 0;

    times.forEach((entry, index) => {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        const timeCell = document.createElement('td');
        const gapCell = document.createElement('td');
        const visualCell = document.createElement('td');

        idCell.textContent = entry.name;
        timeCell.textContent = entry.formattedTime;

        // Calculer les écarts
        const gapToLeader = index > 0 ? times[0].time - entry.time : 0;
        const gapToPredecessor = index > 0 ? times[index - 1].time - entry.time : 0;
        
        // Formater les écarts
        const formatGap = (gap) => {
            if (gap === 0) return '-';
            const sign = gap > 0 ? '+' : '-';
            const hours = Math.floor(gap / (1000 * 60 * 60));
            const minutes = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((gap % (1000 * 60)) / 1000);
            
            if (hours > 0) {
                return `${sign}${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else if (minutes > 0) {
                return `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                return `${sign}${seconds}s`;
            }
        };

        gapCell.innerHTML = `
            <div class="gap-info">
                <div class="gap-leader" title="Écart avec le leader">
                    <span class="gap-label">▲</span>
                    <span class="gap-value">${formatGap(gapToLeader)}</span>
                </div>
                <div class="gap-predecessor" title="Écart avec le prédécesseur">
                    <span class="gap-label">▼</span>
                    <span class="gap-value">${formatGap(gapToPredecessor)}</span>
                </div>
            </div>
        `;

        // Créer l'indicateur visuel
        const visualContainer = document.createElement('div');
        visualContainer.className = 'visual_indicator';

        // Barre de progression
        const progressBar = document.createElement('div');
        progressBar.className = 'progress_bar_simple';

        const progressFill = document.createElement('div');
        progressFill.className = 'progress_fill_simple';
        const progressPercentage = maxTime > 0 ? (entry.time / maxTime) * 100 : 0;
        progressFill.style.width = `${progressPercentage}%`;

        // Déterminer la couleur selon l'écart par rapport à la moyenne
        const deviation = averageTime > 0 ? ((entry.time - averageTime) / averageTime) * 100 : 0;
        let colorClass = 'progress_normal';
        let icon = '';

        if (deviation > 10) {
            colorClass = 'progress_high';
            icon = '🔥'; // Beaucoup plus que la moyenne
        } else if (deviation > 5) {
            colorClass = 'progress_above';
            icon = '📈'; // Plus que la moyenne
        } else if (deviation < -10) {
            colorClass = 'progress_low';
            icon = '❄️'; // Beaucoup moins que la moyenne
        } else if (deviation < -5) {
            colorClass = 'progress_below';
            icon = '📉'; // Moins que la moyenne
        } else {
            icon = '⚖️'; // Équilibré
        }

        progressFill.classList.add(colorClass);

        // Ajouter l'icône d'écart
        const deviationIcon = document.createElement('span');
        deviationIcon.className = 'deviation_icon';
        deviationIcon.textContent = icon;
        deviationIcon.title = `${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%`;

        // Assembler l'indicateur visuel
        progressBar.appendChild(progressFill);
        visualContainer.appendChild(progressBar);
        visualContainer.appendChild(deviationIcon);
        visualCell.appendChild(visualContainer);

        row.appendChild(idCell);
        row.appendChild(timeCell);
        row.appendChild(gapCell);
        row.appendChild(visualCell);

        rankingBody.appendChild(row);
    });

    // Mettre à jour les statistiques et les indicateurs
    updateStatistics();
    updateSpeakingIndicators();
}

function updateStatistics() {
    const activeTimers = timers
        .map((timer, index) => ({ timer, container: counterContainers[index] }))
        .filter(({ container }) => container && container.style.display !== 'none')
        .map(({ timer }) => ({
            name: timer.name,
            time: timer.getElapsedTime(),
            formattedTime: timer.getFormattedTime(),
        }));

    if (activeTimers.length === 0) {
        averageTimeElement.textContent = '00:00:00.00';
        deviationBody.innerHTML = '';
        equityIndicator.textContent = 'Non déterminé';
        equityIndicator.className = 'equity_indicator';
        globalAlert.classList.add('hidden');
        return;
    }

    // Calcul de la moyenne
    const totalTime = activeTimers.reduce((sum, timer) => sum + timer.time, 0);
    const averageTime = totalTime / activeTimers.length;
    averageTimeElement.textContent = formatTime(averageTime);

    // Calcul des écarts et mise à jour du tableau
    const tolerance = parseFloat(toleranceSelect?.value || 5);
    let hasImbalance = false;
    let maxDeviation = 0;

    deviationBody.innerHTML = '';
    activeTimers.forEach(timer => {
        const deviation = averageTime > 0 ? ((timer.time - averageTime) / averageTime) * 100 : 0;
        const absoluteDeviation = Math.abs(deviation);
        
        if (absoluteDeviation > tolerance) {
            hasImbalance = true;
        }
        maxDeviation = Math.max(maxDeviation, absoluteDeviation);

        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const timeCell = document.createElement('td');
        const deviationCell = document.createElement('td');

        nameCell.textContent = timer.name;
        timeCell.textContent = timer.formattedTime;
        
        deviationCell.textContent = `${deviation >= 0 ? '+' : ''}${deviation.toFixed(1)}%`;
        deviationCell.className = absoluteDeviation > tolerance ? 'deviation_warning' : 'deviation_normal';

        row.appendChild(nameCell);
        row.appendChild(timeCell);
        row.appendChild(deviationCell);
        deviationBody.appendChild(row);
    });

    // Mise à jour de l'indicateur global d'équité
    if (hasImbalance) {
        equityIndicator.textContent = 'Non respectée';
        equityIndicator.className = 'equity_indicator not_respected';
        globalAlert.classList.remove('hidden');
    } else {
        equityIndicator.textContent = 'Respectée';
        equityIndicator.className = 'equity_indicator respected';
        globalAlert.classList.add('hidden');
    }
}

function updateSpeakingIndicators() {
    // Vérifier si les indicateurs existent
    if (!speakingIndicators || speakingIndicators.length === 0) {
        console.error('Les indicateurs de temps de parole ne sont pas trouvés');
        return;
    }

    const activeTimers = timers
        .map((timer, index) => ({ timer, container: counterContainers[index], indicator: speakingIndicators[index] }))
        .filter(({ container }) => container && container.style.display !== 'none');

    // Réinitialiser tous les indicateurs à "Moyenne"
    speakingIndicators.forEach((indicator, index) => {
        if (indicator) {
            const container = counterContainers[index];
            if (!container || container.style.display === 'none') {
                indicator.textContent = 'Moyenne';
                indicator.className = 'speaking_indicator';
            }
        }
    });

    if (activeTimers.length === 0) {
        return;
    }

    // Calculer la moyenne
    const totalTime = activeTimers.reduce((sum, { timer }) => sum + timer.getElapsedTime(), 0);
    const averageTime = totalTime / activeTimers.length;
    const tolerance = parseFloat(toleranceSelect?.value || 5);

    // Mettre à jour chaque indicateur
    activeTimers.forEach(({ timer, indicator }) => {
        if (!indicator) {
            console.warn('Indicateur non trouvé pour un timer actif');
            return;
        }

        const timerTime = timer.getElapsedTime();
        const deviation = averageTime > 0 ? ((timerTime - averageTime) / averageTime) * 100 : 0;

        // Déterminer le statut et le texte
        let status = 'average';
        let text = 'Moyenne';

        if (deviation > tolerance) {
            status = 'too_much';
            text = 'Trop parlé';
        } else if (deviation < -tolerance) {
            status = 'too_little';
            text = 'Peu parlé';
        }

        // Mettre à jour l'indicateur
        indicator.textContent = text;
        indicator.className = `speaking_indicator ${status}`;
        
        console.log(`Timer ${timer.name}: ${text} (déviation: ${deviation.toFixed(1)}%)`);
    });
}

function formatTime(time) {
    const hours = Math.floor(time / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((time % (1000 * 60)) / 1000).toString().padStart(2, '0');
    const centiseconds = Math.floor((time % 1000) / 10).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}.${centiseconds}`;
}

function persistState() {
    try {
        const state = {
            exclusiveMode,
            visibleCount: visibleTimerCount,
            toleranceThreshold: toleranceSelect?.value || '5',
            timers: timers.map(timer => ({
                elapsedTime: timer.getElapsedTime(),
                isRunning: timer.isRunning(),
                nameInputValue: timer.nameInput.value,
                lastStartTime: timer.isRunning() ? timer.startTime : null,
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

// Restaurer le seuil de tolérance
if (storedState.toleranceThreshold && toleranceSelect) {
    toleranceSelect.value = storedState.toleranceThreshold;
}

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

// Initialiser les indicateurs de temps de parole
setTimeout(() => {
    updateSpeakingIndicators();
}, 100);

function generateEmailExport() {
    const activeTimers = timers
        .map((timer, index) => ({ timer, container: counterContainers[index] }))
        .filter(({ container }) => container && container.style.display !== 'none')
        .map(({ timer }) => ({
            name: timer.name,
            time: timer.getElapsedTime(),
            formattedTime: timer.getFormattedTime(),
        }));

    if (activeTimers.length === 0) {
        alert('Aucune donnée à exporter. Veuillez d\'abord démarrer les compteurs.');
        return;
    }

    // Calcul des statistiques
    const totalTime = activeTimers.reduce((sum, timer) => sum + timer.time, 0);
    const averageTime = totalTime / activeTimers.length;
    const tolerance = parseFloat(toleranceSelect?.value || 5);
    
    // Tri par ordre décroissant de temps de parole
    const sortedTimers = [...activeTimers].sort((a, b) => b.time - a.time);
    
    // Génération du contenu de l'email
    const currentDate = new Date().toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let emailContent = `Récapitulatif de la session de temps de parole\n`;
    emailContent += `Date: ${currentDate}\n`;
    emailContent += `Nombre de participants: ${activeTimers.length}\n`;
    emailContent += `Seuil de tolérance: ±${tolerance}%\n\n`;

    emailContent += `TEMPS TOTAL DE LA SESSION: ${formatTime(totalTime)}\n`;
    emailContent += `TEMPS MOYEN PAR PARTICIPANT: ${formatTime(averageTime)}\n\n`;

    emailContent += `DÉTAIL PAR PARTICIPANT (par ordre décroissant):\n`;
    emailContent += `${'='.repeat(60)}\n\n`;

    sortedTimers.forEach((timer, index) => {
        const deviation = averageTime > 0 ? ((timer.time - averageTime) / averageTime) * 100 : 0;
        
        emailContent += `${index + 1}. ${timer.name}\n`;
        emailContent += `   Temps: ${timer.formattedTime}\n`;
        emailContent += `   Écart: ${deviation >= 0 ? '+' : ''}${deviation.toFixed(1)}%\n\n`;
    });

    emailContent += `STATISTIQUES D'ÉQUITÉ:\n`;
    emailContent += `${'='.repeat(30)}\n`;
    
    const hasImbalance = activeTimers.some(timer => {
        const deviation = averageTime > 0 ? Math.abs((timer.time - averageTime) / averageTime) * 100 : 0;
        return deviation > tolerance;
    });

    emailContent += `Équité respectée: ${hasImbalance ? 'Non' : 'Oui'}\n`;
    
    if (hasImbalance) {
        const maxDeviation = Math.max(...activeTimers.map(timer => {
            const deviation = averageTime > 0 ? Math.abs((timer.time - averageTime) / averageTime) * 100 : 0;
            return deviation;
        }));
        emailContent += `Écart maximum: ${maxDeviation.toFixed(1)}%\n`;
    }

    emailContent += `\n${'='.repeat(60)}\n`;
    emailContent += `Généré par l'application Compteur TP FTV\n`;
    emailContent += `© 2024 C. Millequand`;

    // Création du mailto
    const subject = encodeURIComponent(`Récapitulatif temps de parole - ${new Date().toLocaleDateString('fr-FR')}`);
    const body = encodeURIComponent(emailContent);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    // Ouverture du client mail
    window.open(mailtoUrl, '_blank');
}

// ------------------------------------------------------------------------------------------------------------------------------------------------
