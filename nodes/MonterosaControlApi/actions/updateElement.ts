import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { createLocalizedValues, LocalizationType } from '../helpers/localization';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';

interface ElementAttributes {
	duration?: number;
	start_mode?: 'manual' | 'timecode';
	offset?: number;
	action?: 'stop' | 'reveal_answer' | 'reveal_results' | 'revoke' | 'publish';
	question?: {
		fields: Array<{
			key: string;
			values: {
				all?: string;
				en?: string;
			};
		}>;
		options?: Array<{
			fields: Array<{
				key: string;
				values: {
					all?: string;
					en?: string;
				};
			}>;
		}>;
	};
	correct_option?: number;
	reveal_results_mode?: 'vote' | 'close' | 'event_end' | 'never' | 'manual';
	require_verified_user?: boolean;
	include_in_latest_results_feed?: boolean;
	certification?: boolean;
	max_votes_per_user?: number;
	max_votes_per_option?: number;
	min_options_per_vote?: number;
	max_options_per_vote?: number;
	reveal_answer_mode?: 'auto' | 'manual';
	reveal_answer_in?: number;
	fade?: number;
	custom_fields?: Array<{
		key: string;
		value: string;
	}>;
	reveal_answer_on_vote?: boolean;
}

interface ElementRequestBody {
	data: {
		id: string;
		type: 'elements';
		attributes: ElementAttributes;
	};
}

export async function executeUpdateElement(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;	
	const elementId = this.getNodeParameter('elementId', index) as string;
	const action = this.getNodeParameter('action', index) as string;
	const localization = this.getNodeParameter('localization', index, 'en') as LocalizationType;

	if (!elementId) {
		throw new NodeOperationError(this.getNode(), 'Element ID is required');
	}

	const requestBody: ElementRequestBody = {
		data: {
			id: elementId,
			type: 'elements',
			attributes: {},
		},
	};

	switch (action) {
		case 'publish':
			requestBody.data.attributes.action = 'publish';
			break;

		case 'stop':
			requestBody.data.attributes.action = 'stop';
			break;

		case 'reveal_answer':
			requestBody.data.attributes.action = 'reveal_answer';
			const correctOption = this.getNodeParameter('correctOption', index) as number;
			requestBody.data.attributes.correct_option = correctOption;
			break;

		case 'reveal_results':
			requestBody.data.attributes.action = 'reveal_results';
			break;

		case 'revoke':
			requestBody.data.attributes.action = 'revoke';
			break;

		case 'update':
			const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;
			const attributes: ElementAttributes = {};

			// Handle basic fields
			if (updateFields.duration) {
				attributes.duration = updateFields.duration as number;
			}
			if (updateFields.startMode) {
				attributes.start_mode = updateFields.startMode as 'manual' | 'timecode';
			}
			if (updateFields.offset) {
				attributes.offset = updateFields.offset as number;
			}

			// Handle question and options
			if (updateFields.question) {
				const question = updateFields.question as IDataObject;
				attributes.question = {
					fields: [],
				};

				// Add question text
				if (question.text) {
					attributes.question.fields.push({
						key: 'text',
						values: createLocalizedValues(question.text as string, localization),
					});
				}


				// Add custom fields
				if (question.customFields) {
					const customFields = question.customFields as IDataObject[];
					customFields.forEach((field) => {
						if (attributes.question) {
							attributes.question.fields.push({
								key: field.key as string,
								values: createLocalizedValues(field.value as string, localization),
							});
						}
					});
				}

				// Handle options
				if (updateFields.options) {
					const options = updateFields.options as { option: IDataObject[] };
					if (attributes.question && options.option) {
						attributes.question.options = options.option.map((option) => {
							const fields = [
								{
									key: 'text',
									values: createLocalizedValues(option.text as string, localization),
								}
							];

							// Handle custom fields if they exist
							const customFields = option.customFields as { field: IDataObject[] } | undefined;
							if (customFields?.field) {
								customFields.field.forEach((field) => {
									fields.push({
										key: field.key as string,
										values: createLocalizedValues(field.value as string, localization),
									});
								});
							}

							return { fields };
						});
					}
				}
			}

			// Handle voting settings
			if (updateFields.votingSettings) {
				const votingSettings = updateFields.votingSettings as IDataObject;
				if (votingSettings.maxVotesPerUser) {
					attributes.max_votes_per_user = votingSettings.maxVotesPerUser as number;
				}
				if (votingSettings.minOptionsPerVote) {
					attributes.min_options_per_vote = votingSettings.minOptionsPerVote as number;
				}
				if (votingSettings.maxOptionsPerVote) {
					attributes.max_options_per_vote = votingSettings.maxOptionsPerVote as number;
				}
				if (votingSettings.requireVerifiedUser !== undefined) {
					attributes.require_verified_user = votingSettings.requireVerifiedUser as boolean;
				}
				if (votingSettings.includeInLatestResults !== undefined) {
					attributes.include_in_latest_results_feed = votingSettings.includeInLatestResults as boolean;
				}
				if (votingSettings.certification !== undefined) {
					attributes.certification = votingSettings.certification as boolean;
				}
				if (votingSettings.revealResultsMode) {
					attributes.reveal_results_mode = votingSettings.revealResultsMode as
						| 'vote'
						| 'close'
						| 'event_end'
						| 'never'
						| 'manual';
				}
			}
			requestBody.data.attributes = attributes;
			break;

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported action: ${action}`);
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'PATCH',
				url: `${getUrl(credentials.environment.toString())}/api/v2/elements/${elementId}`,
				headers: {
					'Content-Type': 'application/vnd.api+json',
					Accept: 'application/json',
				},
				body: requestBody,
			},
		);
		return [{ json: { id: elementId, message: 'Element updated successfully', response } }];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to update element',
			description: getMonterosaErrorDescription(error),
		});
	}
}