import * as SecureStore from 'expo-secure-store';

export class AuthManager {
    static async getDeliveryAgent() {
        try {
            const agentData = await SecureStore.getItemAsync('deliveryAgent');
            return agentData ? JSON.parse(agentData) : null;
        } catch (error) {
            console.error('Error getting delivery agent data:', error);
            return null;
        }
    }

    static async setDeliveryAgent(agentData) {
        try {
            await SecureStore.setItemAsync('deliveryAgent', JSON.stringify(agentData));
            return true;
        } catch (error) {
            console.error('Error setting delivery agent data:', error);
            return false;
        }
    }

    static async getToken() {
        try {
            return await SecureStore.getItemAsync('deliveryToken');
        } catch (error) {
            console.error('Error getting delivery token:', error);
            return null;
        }
    }

    static async setToken(token) {
        try {
            await SecureStore.setItemAsync('deliveryToken', token);
            return true;
        } catch (error) {
            console.error('Error setting delivery token:', error);
            return false;
        }
    }

    static async clearDeliveryAgent() {
        try {
            await SecureStore.deleteItemAsync('deliveryAgent');
            await SecureStore.deleteItemAsync('deliveryToken');
            return true;
        } catch (error) {
            console.error('Error clearing delivery agent data:', error);
            return false;
        }
    }

    static async isAuthenticated() {
        const agent = await this.getDeliveryAgent();
        const token = await this.getToken();
        return agent !== null && token !== null;
    }

    static async getAgentInfo() {
        const agent = await this.getDeliveryAgent();
        if (!agent) return null;
        
        return {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            zone: agent.zone,
            phone: agent.phone
        };
    }
}

// Export individual functions for easier import
export const getToken = AuthManager.getToken.bind(AuthManager);
export const setToken = AuthManager.setToken.bind(AuthManager);
export const getDeliveryAgent = AuthManager.getDeliveryAgent.bind(AuthManager);
export const setDeliveryAgent = AuthManager.setDeliveryAgent.bind(AuthManager);
export const clearDeliveryAgent = AuthManager.clearDeliveryAgent.bind(AuthManager);
export const isAuthenticated = AuthManager.isAuthenticated.bind(AuthManager);

export default AuthManager;
