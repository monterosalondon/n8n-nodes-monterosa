import { ICredentialDataDecryptedObject, IExecuteFunctions } from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { monterosaHttpException } from '../helpers/monterosaHttpException';

export async function executeGetEventTemplate(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const eventTemplateId = this.getNodeParameter('eventTemplateId', index) as string;
	if (!eventTemplateId) {
		throw new Error('Event Template ID is required');
	}

	try {
		const responseData = await this.helpers.httpRequest({
			method: 'GET',
			url: `${getUrl(credentials.environment.toString())}/api/v2/event_templates/${eventTemplateId}`,
			headers: {
				Authorization: `Bearer ${credentials.accessToken}`,
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/json',
			},
		});
		return responseData;
	} catch (error) {
		throw monterosaHttpException(error, {}, 'get');
	}
} 