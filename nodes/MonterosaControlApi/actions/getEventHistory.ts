import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { getCdnUrl } from '../helpers/getUrl';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';

export async function executeGetEventHistory(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const eventId = this.getNodeParameter('eventId', index) as string;
	if (!eventId) {
		throw new NodeOperationError(this.getNode(), 'Event ID is required');
	}

	// Get first two characters of the event UUID
	const eventIdPrefix = eventId.substring(0, 2);
	const url = `${getCdnUrl(credentials.environment.toString())}/events/${eventIdPrefix}/${eventId}/history.json`;
	try {
		const responseData = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'GET',
				url,
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			},
		);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to fetch event history',
			description: getMonterosaErrorDescription(error),
		});
	}
} 