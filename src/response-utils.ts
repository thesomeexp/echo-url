interface ResponseOptions {
    status?: number;
    contentType?: string;
    additionalHeaders?: Record<string, string>;
}

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Vary': 'Origin'
};

export const createOptionsResponse = (): Response => {
    return new Response(null, {
        headers: {
            ...corsHeaders,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        }
    });
};

export const createResponse = (
    body: BodyInit | null,
    options: ResponseOptions = {}
): Response => {
    const {
        status = 200,
        contentType = 'text/plain',
        additionalHeaders = {}
    } = options;

    return new Response(body, {
        status,
        headers: {
            'Content-Type': contentType,
            ...corsHeaders,
            ...additionalHeaders
        }
    });
};

export const createErrorResponse = (
    message: string,
    status = 400
): Response => {
    return createResponse(`Error: ${message}`, {
        status,
        contentType: 'text/plain'
    });
};

export const handleUnknownError = (error: unknown): Response => {
    if (error instanceof Error) {
        return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('An unknown error occurred', 500);
};
