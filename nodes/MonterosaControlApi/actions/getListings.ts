import { ICredentialDataDecryptedObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getCdnUrl } from '../helpers/getUrl';

export async function getListings(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[][]> {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const projectId = this.getNodeParameter('projectID', index) as string;

	const response = await this.helpers.httpRequest({
		method: 'GET',
		url: `${getCdnUrl(credentials.environment.toString())}/projects/${projectId.toString().substring(0, 2)}/${projectId.toString()}/listings.json`
	});

	return response;
}