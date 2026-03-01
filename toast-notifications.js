// Système de notifications toast
class ToastNotification {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Créer le conteneur de toasts s'il n'existe pas
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(message, type = 'info', title = '', duration = 5000) {
        const toastId = 'toast-' + Date.now();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;

        // Déterminer l'icône selon le type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '✅';
                break;
            case 'error':
                icon = '❌';
                break;
            case 'info':
                icon = 'ℹ️';
                break;
            default:
                icon = '📢';
        }

        toast.innerHTML = `
            <button class="toast-close" onclick="toastNotification.hide('${toastId}')">×</button>
            <div class="toast-content">
                ${title ? `<div class="toast-title"><span class="toast-icon">${icon}</span>${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
        `;

        this.container.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Stocker la référence
        this.toasts.set(toastId, {
            element: toast,
            timeout: setTimeout(() => {
                this.hide(toastId);
            }, duration)
        });

        return toastId;
    }

    hide(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, timeout } = toastData;

        // Annuler le timeout si existant
        if (timeout) {
            clearTimeout(timeout);
        }

        // Animation de sortie
        element.classList.remove('show');
        element.classList.add('hide');

        // Supprimer après l'animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    // Méthodes pratiques
    success(message, title = 'Succès', duration = 5000) {
        return this.show(message, 'success', title, duration);
    }

    error(message, title = 'Erreur', duration = 7000) {
        return this.show(message, 'error', title, duration);
    }

    info(message, title = 'Information', duration = 5000) {
        return this.show(message, 'info', title, duration);
    }

    // Cacher tous les toasts
    hideAll() {
        this.toasts.forEach((_, toastId) => {
            this.hide(toastId);
        });
    }
}

// Instance globale
const toastNotification = new ToastNotification();
