import { NextResponse } from 'next/server';

/**
 * API Health Check endpoint
 * Used to verify if the application is running correctly
 * Can be extended to check database connections, external services, etc.
 */
export async function GET() {
  try {
    // Basic health check
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
    };

    // Add optional checks for critical dependencies
    // Example: Database connection check
    // const dbStatus = await checkDatabaseConnection();
    // healthStatus.database = dbStatus;

    // Example: External API check
    // const externalApiStatus = await checkExternalApi();
    // healthStatus.externalApi = externalApiStatus;

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
}

/**
 * This HEAD request handler is useful for minimal health checks
 * that don't need to return data (like load balancers)
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
} 