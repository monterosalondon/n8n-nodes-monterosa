import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';

export async function executeGetEventTemplates(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const projectId = this.getNodeParameter('projectID', index) as string;
	if (!projectId) {
		throw new NodeOperationError(this.getNode(), 'Project ID is required');
	}

	try {
		const responseData = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'GET',
				url: `${getUrl(credentials.environment.toString())}/api/v2/projects/${projectId}/event_templates`,
				headers: {
					'Content-Type': 'application/vnd.api+json',
					Accept: 'application/json',
				},
			},
		);
		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to fetch event templates',
			description: getMonterosaErrorDescription(error),
		});
	}
} 