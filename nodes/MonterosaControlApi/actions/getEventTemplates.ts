import { ICredentialDataDecryptedObject, IExecuteFunctions } from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { monterosaHttpException } from '../helpers/monterosaHttpException';

export async function executeGetEventTemplates(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const projectId = this.getNodeParameter('projectID', index) as string;
	if (!projectId) {
		throw new Error('Project ID is required');
	}

	try {
		const responseData = await this.helpers.httpRequest({
			method: 'GET',
			url: `${getUrl(credentials.environment.toString())}/api/v2/projects/${projectId}/event_templates`,
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