import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeApiError,
} from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';
export async function executeGetElements(this: IExecuteFunctions, index: number) {
	// ✅ Retrieve credentials manually
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const filterState = this.getNodeParameter('filterState', index) as string[];
	const filterLatest = this.getNodeParameter('filterLatest', index) as boolean;
	const includeStats = this.getNodeParameter('includeStats', index) as boolean;
	const eventId = this.getNodeParameter('eventId', index) as string;

	const queryParamsObj: Record<string, string> = {
		'filter[state]': filterState.join(','),
	};
	if(filterLatest){
		queryParamsObj['filter[include_in_latest_results]'] = filterLatest.toString()
	}
	if (includeStats) {
		queryParamsObj['include'] = 'stats';
	}

	const queryParams = new URLSearchParams(queryParamsObj).toString();

	try {
		const responseData = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'GET',
				url: `${getUrl(credentials.environment.toString())}/api/v2/events/${eventId}/elements?${queryParams}`,
				headers: {
					Accept: 'application/json',
				},
			},
		);

		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to fetch elements',
			description: getMonterosaErrorDescription(error),
		});
	}
}
