import { ICredentialDataDecryptedObject, IExecuteFunctions } from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { monterosaHttpException } from '../helpers/monterosaHttpException';


export async function executeDeleteElement(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const elementId = this.getNodeParameter('elementId', index) as string;
	if (!elementId) {
		throw new Error('Element ID is required');
	}
	try {
		await this.helpers.httpRequest({
			method: 'DELETE',
			url: `${getUrl(credentials.environment.toString())}/api/v2/elements/${elementId}`,
			headers: {
				Authorization: `Bearer ${credentials.accessToken}`,
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/json',
			},
		});
		return [{ json: { id: elementId, message: 'Element deleted successfully' } }];
	} catch (error) {
		throw monterosaHttpException(error, {}, 'delete');
	}
}