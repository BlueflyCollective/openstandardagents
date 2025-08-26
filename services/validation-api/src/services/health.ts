import { promises as fs } from 'fs';
import path from 'path';

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    services: {
        database: 'connected' | 'disconnected';
        storage: 'available' | 'unavailable';
        validation: 'operational' | 'error';
    };
    metrics: {
        requests_total: number;
        requests_successful: number;
        requests_failed: number;
        average_response_time_ms: number;
    };
}

let startTime = Date.now();
let requestCount = 0;
let successCount = 0;
let failureCount = 0;
let totalResponseTime = 0;

export function recordRequest(success: boolean, responseTime: number) {
    requestCount++;
    if (success) {
        successCount++;
    } else {
        failureCount++;
    }
    totalResponseTime += responseTime;
}

export async function healthCheck(): Promise<HealthStatus> {
    const uptime = Date.now() - startTime;
    const averageResponseTime = requestCount > 0 ? totalResponseTime / requestCount : 0;

    // Check if we can read the package.json to verify the service is working
    let storageStatus: 'available' | 'unavailable' = 'available';
    try {
        await fs.access(path.join(process.cwd(), 'package.json'));
    } catch {
        storageStatus = 'unavailable';
    }

    const healthStatus: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        uptime,
        services: {
            database: 'connected', // Mock status for now
            storage: storageStatus,
            validation: 'operational'
        },
        metrics: {
            requests_total: requestCount,
            requests_successful: successCount,
            requests_failed: failureCount,
            average_response_time_ms: Math.round(averageResponseTime)
        }
    };

    // Determine overall health status
    if (storageStatus === 'unavailable' || failureCount > successCount) {
        healthStatus.status = 'unhealthy';
    } else if (failureCount > 0) {
        healthStatus.status = 'degraded';
    }

    return healthStatus;
}
