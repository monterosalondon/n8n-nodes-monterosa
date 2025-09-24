import { ICredentialDataDecryptedObject, IExecuteFunctions } from 'n8n-workflow';
import { getCdnUrl } from '../helpers/getUrl';
import { monterosaHttpException } from '../helpers/monterosaHttpException';

export async function executeGetEventHistory(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const eventId = this.getNodeParameter('eventId', index) as string;
	if (!eventId) {
		throw new Error('Event ID is required');
	}

	// Get first two characters of the event UUID
	const eventIdPrefix = eventId.substring(0, 2);
	const url = `${getCdnUrl(credentials.environment.toString())}/events/${eventIdPrefix}/${eventId}/history.json`
	console.log({url})
	try {
		const responseData = await this.helpers.httpRequest({
			method: 'GET',
			url: url,
			headers: {
				Authorization: `Bearer ${credentials.accessToken}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});
		return responseData;
	} catch (error) {

		throw monterosaHttpException(error, {}, 'get');
	}
} 