// Client Supabase pour la sauvegarde des sessions de temps de parole

class SupabaseClient {
    constructor() {
        // Remplacez ces valeurs par vos vraies clés Supabase
        this.supabaseUrl = 'https://ekymoyiwmcftguqxchvy.supabase.co';
        this.supabaseKey = 'sb_publishable_TrDO9qJenA4yCEegCmR2nQ_PuotiO5h';
        this.client = null;
        this.isConnected = false;
    }

    async initialize() {
        try {
            // Vérifier si Supabase est disponible
            if (typeof window.supabase === 'undefined') {
                // Charger le client Supabase depuis CDN si non disponible
                await this.loadSupabaseScript();
            }

            this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            this.isConnected = true;
            console.log('Client Supabase initialisé avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de Supabase:', error);
            this.isConnected = false;
            return false;
        }
    }

    async loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async saveSession(sessionData) {
        if (!this.isConnected) {
            throw new Error('Client Supabase non initialisé');
        }

        try {
            console.log('Tentative de sauvegarde de session:', sessionData);

            // Insérer la session
            const { data: session, error: sessionError } = await this.client
                .from('sessions')
                .insert([{
                    participant_count: sessionData.participantCount,
                    tolerance_threshold: sessionData.toleranceThreshold,
                    total_session_time: sessionData.totalTime,
                    average_time: sessionData.averageTime,
                    equity_respected: sessionData.equityRespected,
                    max_deviation: sessionData.maxDeviation
                }])
                .select()
                .single();

            if (sessionError) {
                console.error('Erreur session:', sessionError);
                throw sessionError;
            }

            console.log('Session créée:', session);

            // Insérer les participants
            const participantsData = sessionData.participants.map((participant, index) => ({
                session_id: session.id,
                participant_name: participant.name,
                time_ms: participant.time,
                deviation_percentage: participant.deviation,
                rank: index + 1
            }));

            console.log('Données participants:', participantsData);

            const { data: participants, error: participantsError } = await this.client
                .from('session_participants')
                .insert(participantsData);

            if (participantsError) {
                console.error('Erreur participants:', participantsError);
                throw participantsError;
            }

            console.log('Participants sauvegardés:', participants);
            console.log('Session sauvegardée avec succès:', session.id);
            return session.id;
        } catch (error) {
            console.error('Erreur complète lors de la sauvegarde de la session:', error);
            throw error;
        }
    }

    async getSessions(limit = 50) {
        if (!this.isConnected) {
            throw new Error('Client Supabase non initialisé');
        }

        try {
            const { data, error } = await this.client
                .from('sessions')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération des sessions:', error);
            throw error;
        }
    }

    async getSessionWithParticipants(sessionId) {
        if (!this.isConnected) {
            throw new Error('Client Supabase non initialisé');
        }

        try {
            const { data, error } = await this.client
                .from('sessions')
                .select(`
                    *,
                    session_participants (*)
                `)
                .eq('id', sessionId)
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la session:', error);
            throw error;
        }
    }

    async deleteSession(sessionId) {
        if (!this.isConnected) {
            throw new Error('Client Supabase non initialisé');
        }

        try {
            const { error } = await this.client
                .from('sessions')
                .delete()
                .eq('id', sessionId);

            if (error) {
                throw error;
            }

            console.log('Session supprimée avec succès:', sessionId);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression de la session:', error);
            throw error;
        }
    }
}

// Instance globale du client
const supabaseClient = new SupabaseClient();
