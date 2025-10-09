import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';


export async function executeDeleteElement(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const elementId = this.getNodeParameter('elementId', index) as string;
	if (!elementId) {
		throw new NodeOperationError(this.getNode(), 'Element ID is required');
	}
	try {
		await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'DELETE',
				url: `${getUrl(credentials.environment.toString())}/api/v2/elements/${elementId}`,
				headers: {
					'Content-Type': 'application/vnd.api+json',
					Accept: 'application/json',
				},
			},
		);
		return [{ json: { id: elementId, message: 'Element deleted successfully' } }];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to delete element',
			description: getMonterosaErrorDescription(error),
		});
	}
}