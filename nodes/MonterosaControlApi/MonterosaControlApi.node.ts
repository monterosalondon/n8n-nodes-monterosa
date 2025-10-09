import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionType,
} from 'n8n-workflow';

import { eventProperties } from './properties/eventProperties';
import { elementProperties } from './properties/elementProperties';
import { executeGetEvents } from './actions/getEvents';
import { executeGetElements } from './actions/getElements';
import { executeCreateEventAction } from './actions/createEventAction';
import { executeUpdateEventAction } from './actions/updateEventAction';
import { getListings } from './actions/getListings';
import { executeCreateElement } from './actions/createElement';
import { executeUpdateElement } from './actions/updateElement';
import { listingProperties } from './properties/listingProperties';
import { executeDeleteElement } from './actions/deleteElement';
import { eventTemplateProperties } from './properties/eventTemplateProperties';
import { executeGetEventTemplates } from './actions/getEventTemplates';
import { executeGetEventTemplate } from './actions/getEventTemplate';
import { executeGetEventHistory } from './actions/getEventHistory';
import { getUrl } from './helpers/getUrl';

export class MonterosaControlApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Monterosa Automation',
		name: 'monterosaControlApi',
			icon: 'file:monterosa.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Interact with Monterosa Control API',
		defaults: {
			name: 'Monterosa Automation',
		},
		inputs: [{ type: NodeConnectionType.Main }],
		outputs: [{ type: NodeConnectionType.Main }],
		credentials: [
			{
				name: 'monterosaControlApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Project ID',
				name: 'projectID',
				type: 'string',
				default: '',
				placeholder: 'Enter your project ID',
				required: true,
				description: 'The ID of your Monterosa project',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Event',
						value: 'events',
					},
					{
						name: 'Element',
						value: 'elements',
					},
					{
						name: 'Listing',
						value: 'listings',
					},
					{
						name: 'Event Template',
						value: 'eventTemplates',
					},
				],
				default: 'events',
			},
			...eventProperties,
			...elementProperties,
			...listingProperties,
			...eventTemplateProperties,
			
		],
	};
	methods = {
		loadOptions: {
			getElementContentTypes: async function (this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectID = this.getNodeParameter('projectID', null, {}) as string;
				if (!projectID) {
					return [
						{
							name: 'Please Enter a Project ID and Try Again.',
							value: '',
						},
					];
				}

				const credentials = (await this.getCredentials('monterosaControlApi')) as {
					environment?: string;
				};
				const environment = credentials?.environment?.toString() ?? 'us';
				const baseUrl = getUrl(environment);

				try {
					const projectResponse = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						'monterosaControlApi',
						{
							method: 'GET',
							url: `${baseUrl}/api/v2/projects/${projectID}`,
							json: true,
						},
					)) as any;

					const projectData = projectResponse.data;
					const appId = projectData.relationships.app.data.id;

					const appData = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						'monterosaControlApi',
						{
							method: 'GET',
							url: `${baseUrl}/api/v2/apps/${appId}`,
							json: true,
						},
					)) as any;

					const specUrl = appData.data.attributes.spec_url.replace('spec.json', 'elements.json');
					const specData = (await this.helpers.httpRequest({
						method: 'GET',
						url: specUrl,
						json: true,
					})) as any[];

					return [
						{
							name: 'Please Select a Content Type',
							value: '',
						},
						...specData.map((element: any) => ({
							name: element.derived_from
								? `${element.name} - (${element.derived_from.charAt(0).toUpperCase() + element.derived_from.slice(1)})`
								: element.name,
							value: `${element.content_type}|${element.derived_from}`,
						})),
					];
				} catch (error) {
					throw new NodeApiError(this.getNode(), error, {
						message: 'Failed to load element types',
						description: 'The Monterosa API request for element content types was not successful.',
					});
				}
			},
		},
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			let responseData;

			// Call the correct execution function
			if (resource === 'events') {
				if (operation === 'getEvents') {
					responseData = await executeGetEvents.call(this, i);
				}
				if (operation === 'createEvent') {
					responseData = await executeCreateEventAction.call(this, i);
				}
				if (operation === 'updateEvent') {
					responseData = await executeUpdateEventAction.call(this, i);
				}
				if (operation === 'getEventHistory') {
					responseData = await executeGetEventHistory.call(this, i);
				}
			}

			if (resource === 'elements') {
				if (operation === 'getElements') {
					responseData = await executeGetElements.call(this, i);
				} else if (operation === 'createElement') {
					responseData = await executeCreateElement.call(this, i);
				} else if (operation === 'updateElement') {
					responseData = await executeUpdateElement.call(this, i);
				} else if (operation === 'deleteElement') {
					responseData = await executeDeleteElement.call(this, i);
				}
			}
			if (resource === 'listings') {
				if (operation === 'getListings') {
					responseData = await getListings.call(this, i);
				}
			}
			if (resource === 'eventTemplates') {
				if (operation === 'getEventTemplates') {
					responseData = await executeGetEventTemplates.call(this, i);
				}
				if (operation === 'getEventTemplate') {
					responseData = await executeGetEventTemplate.call(this, i);
				}
			}

			if (Array.isArray(responseData)) {
				responseData.forEach((data) => {
					returnData.push({ json: data, pairedItem: { item: i } });
				});
			} else if (responseData) {
				returnData.push({ json: responseData, pairedItem: { item: i } });
			} else {
				returnData.push({ json: {}, pairedItem: { item: i } });
			}
		}

		return [returnData];
	}
}
