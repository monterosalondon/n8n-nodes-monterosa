import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeApiError,
} from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';
export async function executeGetEvents(this: IExecuteFunctions, index: number) {
	const credentials = (await this.getCredentials(
		'monterosaControlApi',
		index,
	)) as ICredentialDataDecryptedObject;

	const filterState = this.getNodeParameter('filterState', index) as string;
	const onlyListings = this.getNodeParameter('onlyListings', index) as boolean;
	const include = this.getNodeParameter('include', index) as string[];
	const pageCursor = this.getNodeParameter('pageCursor', index) as string;
	const pageCount = this.getNodeParameter('pageCount', index) as number;
	const sort = this.getNodeParameter('sort', index) as string;
    const projectId = this.getNodeParameter('projectID', index) as string;

	const queryParamsObj: Record<string, string> = {
		'page[count]': pageCount.toString(),
		'filter[state]': filterState,
		sort: sort,
	};


	if (onlyListings) {
		queryParamsObj['filter[only_listings]'] = 'true';
	}

	if (include && include.length > 0) {
		queryParamsObj['include'] = include.join(',');
	}

	if (pageCursor) {
		queryParamsObj['page[cursor]'] = pageCursor;
	}

	const queryParams = new URLSearchParams(queryParamsObj).toString();

	try {
		const responseData = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'monterosaControlApi',
			{
				method: 'GET',
				url: `${getUrl(credentials.environment.toString())}/api/v2/projects/${projectId}/events?${queryParams}`,
				headers: {
					Accept: 'application/json',
				},
			},
		);

		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, {
			message: 'Failed to fetch events',
			description: getMonterosaErrorDescription(error),
		});
	}
}
