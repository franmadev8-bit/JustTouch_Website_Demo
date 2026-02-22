import axios, { AxiosInstance } from "axios";
import Cookie from 'js-cookie';

interface ApiReponse<T> {
    data?: T;
    success: boolean;
    status: number;
    error?: string;
}

export class JustTouchClient {
    instance: AxiosInstance;
    private static clientInstance: JustTouchClient;

    constructor() {
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_SERVICE_BASE_URL
        })

        this.instance.interceptors.request.use((config) => {
            var token = Cookie.get('JToken');
            if(token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        })

        this.instance.interceptors.response.use((config) => {
            return config;
        }, error => {
            return Promise.reject({
                status: error.response?.status,
                message: error.response?.data?.message ?? 'Error inesperado',
                raw: error
            });
        })
    }

    public static getInstance() {
        if (!JustTouchClient.clientInstance) {
            JustTouchClient.clientInstance = new JustTouchClient();
        }
        return JustTouchClient.clientInstance;
    }

    public async Get<T>(controller: string, endpoint: string): Promise<ApiReponse<T>> {
        try {
            const response = await this.instance.get(`${controller}/${endpoint}`);
            return {
                data: response.data,
                status: response.status,
                success: true,
                error: undefined
            }
        } catch (error: any) {
            return {
                data: undefined,
                status: error.status,
                success: false,
                error: error.message
            }
        }

    }

    public async Post<TRequest, TResponse>(controller: string, endpoint: string, payload: TRequest): Promise<ApiReponse<TResponse>> {
        try {
            const response = await this.instance.post(`${controller}/${endpoint}`, payload);

            return {
                data: response.data as TResponse,
                status: response.status,
                success: response.status >= 200 && response.status <= 299,
                error: response.statusText
            }
        } catch (error: any) {
            return {
                data: undefined,
                status: error.status,
                success: false,
                error: error.message
            }
        }

    }
}