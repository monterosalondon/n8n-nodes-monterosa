import { ICredentialDataDecryptedObject, IExecuteFunctions } from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { createLocalizedValues, LocalizationType } from '../helpers/localization';
import { monterosaHttpException } from '../helpers/monterosaHttpException';

interface ElementAttributes {
	content_type: string;
	start_mode: string;
	duration: number;
	question: {
		fields: {
			key: string;
			values: {
				en?: string;
				all?: string;
			};
		}[];
		options: {
			fields: {
				key: string;
				values: {
					en?: string;
					all?: string;
				};
			}[];
		}[];
	};
	max_votes_per_user?: number;
	min_options_per_vote?: number;
	max_options_per_vote?: number;
	require_verified_user?: boolean;
	include_in_latest_results_feed?: boolean;
	certification?: boolean;
	offset?: number;
	correct_option?: number;
	custom_fields?: {
		key: string;
		values: {
			en?: string;
			all?: string;
		};
	}[];
}

interface ElementRequestBody {
	data: {
		type: 'elements';
		relationships: {
			event: {
				data: {
					type: 'events';
					id: string;
				};
			};
		};
		attributes: ElementAttributes;
	};
}

export async function executeCreateElement(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const useCustomJson = this.getNodeParameter('useCustomJson', index) as boolean;

	let requestBody: ElementRequestBody = {
		data: {
			type: 'elements',
			relationships: {
				event: {
					data: {
						type: 'events',
						id: '',
					},
				},
			},
			attributes: {
				content_type: '',
				start_mode: '',
				duration:  0,
				question: {
					fields: [],
					options: [],
				},
			},
		},
	};

	if (useCustomJson) {
		const customJson = this.getNodeParameter('customJson', index) as string;
		try {
			requestBody = JSON.parse(customJson);
		} catch (error) {
			// Create a more descriptive error message for the n8n UI
			const errorDetails = error.response?.data?.errors?.map((err: any) => {
				const field = err.source?.pointer?.split('/').pop() || 'unknown field';
				return `${field}: ${err.detail}`;
			}).join(', ') || error.message;
			
			const errorMessage = `Failed to create element (${error.response?.status}): ${errorDetails}`;
			
			throw new Error(errorMessage);
		}
	} else {
		const eventId = this.getNodeParameter('eventId', index) as string;
		const contentTypeParts = this.getNodeParameter('contentTypeParts', index) as string;
		const contentType = contentTypeParts.split('|')[0];
		const contentTypeDerivedFrom = contentTypeParts.split('|')[1];
		const startMode = this.getNodeParameter('startMode', index) as string;
		const duration = this.getNodeParameter('duration', index, 0) as number;
		const localization = this.getNodeParameter('localization', index, 'en') as LocalizationType;
		const question = this.getNodeParameter('question', index) as { 
			text: string; 
			imageUrl?: string;
			customFields?: {
				field: Array<{
					key: string;
					value: string;
				}>;
			};
		};
		const options = this.getNodeParameter('options', index) as { 
			option: Array<{
				text: string;
				imageUrl?: string;
				customFields?: {
					field: Array<{
						key: string;
						value: string;
					}>;
				};
			}>;
		};
		const votingSettings = this.getNodeParameter('votingSettings', index) as {
			maxVotesPerUser?: number;
			minOptionsPerVote?: number;
			maxOptionsPerVote?: number;
			requireVerifiedUser?: boolean;
			includeInLatestResults?: boolean;
			certification?: boolean;
		};

		// Get correct option index for trivia elements
		const correctOptionIndex = this.getNodeParameter('correctOptionIndex', index, 0) as number;

		// Validate required fields
		if (!eventId) {
			throw new Error('Event ID is required');
		}
		if (!contentType) {
			throw new Error('Content Type is required');
		}
		if (!startMode) {
			throw new Error('Start Mode is required');
		}
		if (!duration) {
			throw new Error('Duration is required');
		}
		if (!question?.text) {
			throw new Error('Question Text is required');
		}
		if (!options?.option || options.option.length === 0) {
			throw new Error('At least one option is required');
		}

		// Build the request body
		requestBody = {
			data: {
				type: 'elements',
				relationships: {
					event: {
						data: {
							type: 'events',
							id: eventId,
						},
					},
				},
				attributes: {
					content_type: contentType,
					start_mode: startMode,
					duration,
					question: {
						fields: [
							{
								key: 'text',
								values: createLocalizedValues(question.text, localization),
							},
						],
						options: options.option.map((opt) => ({
							fields: [
								{
									key: 'text',
									values: createLocalizedValues(opt.text, localization),
								},
							],
						})),
					},
				},
			},
		};

		// Add optional fields if they exist
		if (question.imageUrl) {
			requestBody.data.attributes.question.fields.push({
				key: 'image_url',
				values: createLocalizedValues(question.imageUrl, localization),
			});
		}

		// Add custom fields to question if they exist
		if (question.customFields?.field) {
			question.customFields.field.forEach((field) => {
				requestBody.data.attributes.question.fields.push({
					key: field.key,
					values: createLocalizedValues(field.value, localization),
				});
			});
		}

		// Add image URLs and custom fields to options if they exist
		options.option.forEach((opt, index) => {
			if (opt.imageUrl) {
				requestBody.data.attributes.question.options[index].fields.push({
					key: 'image_url',
					values: createLocalizedValues(opt.imageUrl, localization),
				});
			}
			if (opt.customFields?.field) {
				opt.customFields.field.forEach((field) => {
					requestBody.data.attributes.question.options[index].fields.push({
						key: field.key,
						values: createLocalizedValues(field.value, localization),
					});
				});
			}
		});

		// Add voting settings if they exist
		if (votingSettings) {
			if (votingSettings.maxVotesPerUser) {
				requestBody.data.attributes.max_votes_per_user = votingSettings.maxVotesPerUser;
			}
			if (votingSettings.minOptionsPerVote) {
				requestBody.data.attributes.min_options_per_vote = votingSettings.minOptionsPerVote;
			}
			if (votingSettings.maxOptionsPerVote) {
				requestBody.data.attributes.max_options_per_vote = votingSettings.maxOptionsPerVote;
			}
			if (votingSettings.requireVerifiedUser !== undefined) {
				requestBody.data.attributes.require_verified_user = votingSettings.requireVerifiedUser;
			}
			if (votingSettings.includeInLatestResults !== undefined) {
				requestBody.data.attributes.include_in_latest_results_feed = votingSettings.includeInLatestResults;
			}
			if (votingSettings.certification !== undefined) {
				requestBody.data.attributes.certification = votingSettings.certification;
			}
		}
		// Add correct option for trivia elements
		if (contentTypeDerivedFrom === 'trivia' || contentTypeDerivedFrom === 'prediction') {
			requestBody.data.attributes.correct_option = correctOptionIndex;
		}
		if (contentTypeDerivedFrom === 'prediction' || contentTypeDerivedFrom === 'trivia') {
			requestBody.data.attributes.custom_fields = [
				{
					key: 'correctAnswer',
					values: createLocalizedValues(correctOptionIndex.toString(), localization),
				},
			];
		}

		// Add offset if start mode is timecode
		if (startMode === 'timecode') {
			const offset = this.getNodeParameter('offset', index) as number;
			requestBody.data.attributes.offset = offset;
		}
	}

	try {
		const responseData = await this.helpers.httpRequest({
			method: 'POST',
			url: `${getUrl(credentials.environment.toString())}/api/v2/elements`,
			headers: {
				Authorization: `Bearer ${credentials.accessToken}`,
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/json',
			},
			body: requestBody,
		});

		return responseData;
	} catch (error) {
		throw monterosaHttpException(error, requestBody, 'create');
	}
}