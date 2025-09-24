import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
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
		icon: 'file:monterosa.png',
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
						name: 'Listings',
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
			getElementContentTypes: async function(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await (this.getCredentials('monterosaControlApi'));
					const projectID = this.getNodeParameter('projectID', null,{
						
					}) as string;
					if (!projectID) {
						return [{
							name: 'Please enter a Project ID and try again.',
							value: '',
						}]
					}
					const response = await fetch(`${getUrl(credentials.environment.toString())}/api/v2/projects/${projectID}`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${credentials.accessToken}`
						}
					});

					if (!response.ok) {
						return [{
							name: `Failed to fetch project data. Please check your Project ID and credentials. (Status: ${response.status})`,
							value: '',
						}];
					}

					const projectResponse = (await response.json()) as any;
					if(projectResponse.error) {
						return [{
							name: `Project error: ${projectResponse.error}`,
							value: '',
						}];
					}

					const projectData = projectResponse.data;
					const appID = projectData.relationships.app.data.id;
					const appDataRequest = await fetch(`${getUrl(credentials.environment.toString())}/api/v2/apps/${appID}`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${credentials.accessToken}`
						}
					});

					if (!appDataRequest.ok) {
						return [{
							name: `Failed to fetch app data. Please try again later. (Status: ${appDataRequest.status})`,
							value: '',
						}];
					}

					const appData = (await appDataRequest.json()) as any;
					if(appData.error) {
						return [{
							name: `App error: ${appData.error}`,
							value: '',
						}];
					}

					const specUrl = appData.data.attributes.spec_url.replace('spec.json', 'elements.json');
					const specResponse = await fetch(specUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}
					});

					if (!specResponse.ok) {
						return [{
							name: `Failed to fetch element types. Please try again later. (Status: ${specResponse.status})`,
							value: '',
						}];
					}

					const specData = (await specResponse.json()) as any[];
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
						}))
					];
				} catch (error) {
					return [{
						name: `Failed to load element types. Please check your connection and try again.`,
						value: '',
					}];
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

			if (responseData) {
				returnData.push({ json: responseData });
			}
		}

		return [returnData];
	}
}
