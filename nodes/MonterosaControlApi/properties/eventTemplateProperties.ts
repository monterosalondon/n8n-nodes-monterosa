import { INodeProperties } from 'n8n-workflow';

export const eventTemplateProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get Event Template',
				value: 'getEventTemplate',
				description: 'Get event template with specified identifier',
				action: 'Get event template',
			},
			{
				name: 'Get Event Templates',
				value: 'getEventTemplates',
				description: 'Get all event templates of a specific project',
				action: 'Get event templates',
			},
		],
		default: 'getEventTemplate',
		displayOptions: {
			show: {
				resource: ['eventTemplates'],
			},
		},
	},
	{
		displayName: 'Event Template ID',
		name: 'eventTemplateId',
		type: 'string',
		default: 'b9cb1ba0-d1d3-4f44-8248-d78f8bd4a323',
		required: true,
		description: 'ID of the event template to retrieve (e.g. b9cb1ba0-d1d3-4f44-8248-d78f8bd4a323)',
		displayOptions: {
			show: {
				resource: ['eventTemplates'],
				operation: ['getEventTemplate'],
			},
		},
	},
]; 