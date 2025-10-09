interface MonterosaApiError {
	response?: {
		data?: {
			errors?: Array<{
				detail?: unknown;
				title?: unknown;
				source?: {
					pointer?: unknown;
				};
			}>;
			error?: unknown;
			message?: unknown;
		};
	};
	message?: unknown;
}

function normalizeMessage(value: unknown): string | undefined {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed !== '' ? trimmed : undefined;
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return value.toString();
	}
	return undefined;
}

export function getMonterosaErrorDescription(
	error: unknown,
	fallback = 'The Monterosa API returned an error.',
): string {
	if (!error || typeof error !== 'object') {
		return fallback;
	}

	const typedError = error as MonterosaApiError;
	const responseData = typedError.response?.data;

	if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
		const formatted = responseData.errors
			.map((apiError) => {
				const detail = normalizeMessage(apiError?.detail) ?? normalizeMessage(apiError?.title);
				const pointer = normalizeMessage(apiError?.source?.pointer);

				if (detail && pointer) {
					const field = pointer.split('/').pop() || pointer;
					return `${field}: ${detail}`;
				}
				return detail ?? pointer ?? undefined;
			})
			.filter((value): value is string => value !== undefined);

		if (formatted.length > 0) {
			return formatted.join(', ');
		}
	}

	const singularError = normalizeMessage(responseData?.error)
		?? normalizeMessage(responseData?.message)
		?? normalizeMessage(typedError.message);

	return singularError ?? fallback;
}



