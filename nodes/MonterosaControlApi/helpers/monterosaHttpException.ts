interface ErrorResponse {
	status?: number;
	statusText?: string;
	data?: any;
	message: string;
}

export function monterosaHttpException(error: any, requestBody?: any, operation?: string): Error {
	const errorResponse: ErrorResponse = {
		status: error.response?.status,
		statusText: error.response?.statusText,
		data: error.response?.data,
		message: error.message,
	};

	// Log detailed error information
	console.error('Error details:', JSON.stringify(errorResponse, null, 2));
	if (requestBody) {
		console.error('Request body:', JSON.stringify(requestBody, null, 2));
	}

	// Create a more descriptive error message for the n8n UI
	let errorDetails: string;
	const apiErrors = error.response?.data?.errors;
	if (Array.isArray(apiErrors) && apiErrors.length > 0) {
		errorDetails = apiErrors
			.map((err: any) => {
				const detail = (err?.detail ?? '').toString().trim();
				const pointer = (err?.source?.pointer ?? '').toString().trim();
				// If pointer is not provided, return only the API-provided detail
				if (detail && !pointer) return detail;
				// If both exist, include a concise field + pointer context
				if (detail && pointer) {
					const field = pointer.split('/').pop() || pointer;
					return `${field} (${pointer}): ${detail}`;
				}
				// Fallbacks
				return detail || 'Unknown error';
			})
			.join(', ');
	} else {
		errorDetails = error.message;
	}
	
	return new Error(`Failed to ${operation} element (${error.response?.status}): ${errorDetails}`);
} 