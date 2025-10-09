import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeApiError,
} from 'n8n-workflow';
import { getCdnUrl } from '../helpers/getUrl';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';

export async function getListings(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[][]> {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const projectId = this.getNodeParameter('projectID', index) as string;

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'GET',
				url: `${getCdnUrl(credentials.environment.toString())}/projects/${projectId.toString().substring(0, 2)}/${projectId.toString()}/listings.json`,
			},
		);

		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to fetch listings',
			description: getMonterosaErrorDescription(error),
		});
	}
}