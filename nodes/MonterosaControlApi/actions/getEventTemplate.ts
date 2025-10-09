import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';

export async function executeGetEventTemplate(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const eventTemplateId = this.getNodeParameter('eventTemplateId', index) as string;
	if (!eventTemplateId) {
		throw new NodeOperationError(this.getNode(), 'Event Template ID is required');
	}

	try {
		const responseData = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'GET',
				url: `${getUrl(credentials.environment.toString())}/api/v2/event_templates/${eventTemplateId}`,
				headers: {
					'Content-Type': 'application/vnd.api+json',
					Accept: 'application/json',
				},
			},
		);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to fetch event template',
			description: getMonterosaErrorDescription(error),
		});
	}
} 